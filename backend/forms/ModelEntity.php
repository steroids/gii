<?php

namespace steroids\gii\forms;

use steroids\auth\UserInterface;
use steroids\core\base\Model;
use steroids\core\helpers\ClassFile;
use steroids\gii\enums\ClassType;
use steroids\gii\enums\MigrateMode;
use steroids\gii\forms\meta\ModelEntityMeta;
use steroids\gii\GiiModule;
use steroids\gii\helpers\GiiHelper;
use steroids\gii\models\MigrationMethods;
use steroids\gii\models\ValueExpression;
use steroids\gii\traits\EntityTrait;
use steroids\core\types\RelationType;
use yii\helpers\ArrayHelper;

/**
 * @property-read ModelAttributeEntity[] $attributeItems
 * @property-read ModelAttributeEntity[] $publicAttributeItems
 * @property-read ModelRelationEntity[] $relationItems
 * @property-read ModelRelationEntity[] $publicRelationItems
 */
class ModelEntity extends ModelEntityMeta implements EntityInterface
{
    use EntityTrait;

    /**
     * @var ClassFile
     */
    public $classFile;

    /**
     * @return static[]
     * @throws \ReflectionException
     */
    public static function findAll()
    {
        $items = [];
        foreach (GiiHelper::getModulesClasses(ClassType::MODEL) as $classFile) {
            $items[] = static::findOne($classFile);
        }

        ArrayHelper::multisort($items, 'name');
        return $items;
    }

    public static function findOne(ClassFile $classFile)
    {
        $className = $classFile->className;
        if (!is_subclass_of($className, Model::class)) {
            return null;
        }
        return static::findOrCreate($classFile);
    }

    /**
     * @param ClassFile $classFile
     * @return static
     * @throws \ReflectionException
     */
    public static function findOrCreate(ClassFile $classFile)
    {
        $entity = new static();
        $entity->name = $classFile->name;
        $entity->namespace = $classFile->namespace;
        $entity->classFile = $classFile;

        $entity->validate('migrateMode');

        /** @var Model $className */
        $className = $classFile->className;
        if (class_exists($className) && is_subclass_of($className, Model::class)) {
            $entity->tableName = $className::tableName();
            $entity->populateRelation('attributeItems', ModelAttributeEntity::findAll($entity));
            $entity->populateRelation('relationItems', ModelRelationEntity::findAll($entity));
        }

        return $entity;
    }

    public function load($data, $formName = null)
    {
        if (parent::load($data, $formName)) {
            // Set modelEntity link
            foreach ($this->attributeItems as $attributeEntity) {
                $attributeEntity->modelEntity = $this;
            }
            foreach ($this->relationItems as $relationEntity) {
                $relationEntity->modelEntity = $this;
            }

            return true;
        }
        return false;
    }

    /**
     * @inheritDoc
     */
    public function rules()
    {
        return [
            ['name', 'filter', 'filter' => function ($value) {
                return ucfirst($value);
            }],
        ];
    }

    public function fields()
    {
        return [
            'namespace',
            'name',
            'className' => function(ModelEntity $entity) {
                return $entity->classFile->className;
            },
            'tableName',
            'migrateMode',
            'queryModel',
            'attributeItems',
            'relationItems',
        ];
    }

    public function save()
    {
        if ($this->validate()) {
            $prevModelEntity = class_exists($this->getClassName())
                ? static::findOne($this->classFile)
                : null;

            // Lazy create module
            ModuleEntity::autoCreateForEntity($this);

            // Create/update meta information
            GiiHelper::renderFile('model/meta', $this->classFile->metaPath, [
                'modelEntity' => $this,
            ]);
            \Yii::$app->session->addFlash('success', 'Meta  info model ' . $this->name . 'Meta updated');

            // Create model, if not exists
            if (!file_exists($this->classFile->path)) {
                GiiHelper::renderFile('model/model', $this->classFile->path, [
                    'modelEntity' => $this,
                ]);
                \Yii::$app->session->addFlash('success', 'Added model ' . $this->name);
            }

            // Create migration
            $migrationMethods = new MigrationMethods([
                'prevModelEntity' => $prevModelEntity,
                'nextModelEntity' => $this,
                'migrateMode' => !empty($this->migrateMode)
                    ? $this->migrateMode
                    : MigrateMode::UPDATE,
            ]);
            if (!$migrationMethods->isEmpty()) {
                $name = $migrationMethods->generateName();
                $path = $this->classFile->moduleDir . '/migrations/' . $name . '.php';

                GiiHelper::renderFile('model/migration', $path, [
                    'modelEntity' => $this,
                    'name' => $name,
                    'namespace' => 'app\\' . implode('\\', explode('.', $this->classFile->moduleId)) . '\\migrations',
                    'migrationMethods' => $migrationMethods,
                ]);
                \Yii::$app->session->addFlash('success', 'Added migration ' . $name);
            }

            return true;
        }
        return false;
    }

    public function getClassName()
    {
        return $this->classFile->className;
    }

    /**
     * @param string $name
     * @return null|ModelAttributeEntity
     */
    public function getAttributeEntity($name)
    {
        foreach ($this->attributeItems as $item) {
            if ($item->name === $name) {
                return $item;
            }
        }
        return null;
    }

    /**
     * @param string $name
     * @return null|ModelRelationEntity
     */
    public function getRelationEntity($name)
    {
        foreach ($this->relationItems as $item) {
            if ($item->name === $name) {
                return $item;
            }
        }
        return null;
    }

    public function getPublicAttributeItems()
    {
        return array_filter($this->attributeItems, function (ModelAttributeEntity $item) {
            return !$item->isProtected;
        });
    }

    public function getPublicRelationItems()
    {
        return array_filter($this->relationItems, function (ModelRelationEntity $item) {
            return !$item->isProtected;
        });
    }

    /**
     * @param string $indent
     * @param array $useClasses
     * @return mixed|string
     */
    public function renderMeta($indent = '', &$useClasses = [])
    {
        $category = strpos($this->getClassName(), 'steroids\\') === 0 ? 'steroids' : 'app';
        $meta = static::exportMeta($this->publicAttributeItems, $useClasses);
        foreach ($meta as $name => $item) {
            foreach ($item as $key => $value) {
                // Localization
                if (in_array($key, ['label', 'hint'])) {
                    $meta[$name][$key] = new ValueExpression('Yii::t(\'' . $category . '\', ' . GiiHelper::varExport($value) . ')');
                    $useClasses[] = '\Yii';
                }

                if ($key === 'enumClassName') {
                    $enumEntity = EnumEntity::findOne(ClassFile::createByClass($value, ClassFile::TYPE_ENUM));
                    $meta[$name][$key] = new ValueExpression($enumEntity->name . '::class');
                    $useClasses[] = $enumEntity->getClassName();
                }
            }
        }
        return GiiHelper::varExport($meta, $indent);
    }

    /**
     * @return array
     */
    public function getJsFields($searchForm = false, $locale = false)
    {
        $result = [];

        foreach (static::exportMeta($this->publicAttributeItems) as $attribute => $item) {
            $props = [];
            $type = \Yii::$app->types->getType($this->getAttributeEntity($attribute)->appType);
            if (!$type) {
                var_dump($attribute, $item);exit();
            }

            if ($searchForm) {
                $type->prepareSearchFieldProps($this->getClassName(), $attribute, $props);
            } else {
                // Add label and hint
                foreach (['label', 'hint'] as $key) {
                    if (empty($item[$key])) {
                        continue;
                    }

                    $text = ArrayHelper::getValue($item, $key);
                    if ($text) {
                        $props[$key] = $locale ? GiiHelper::locale($text) : $text;
                    }
                }

                // Add required
                if (ArrayHelper::getValue($item, 'isRequired')) {
                    $props['required'] = true;
                }

                // Add other props
                $type->prepareFieldProps($this->getClassName(), $attribute, $props);
            }

            if (!empty($props)) {
                $result[$attribute] = $props;
            }
        }

        return $result;
    }

    /**
     * @param Model|UserInterface $user
     * @return array
     */
    public function getStaticPermissions($user)
    {
        if (is_subclass_of($this->className, Model::class)) {
            return [
                'canCreate' => (new $this->className())->canCreate($user)
            ];
        }
        return null;
    }

    /**
     * @param bool $locale
     * @param string $indent
     * @param array $import
     * @return mixed|string
     */
    public function getJsFormatters($locale = false)
    {
        $result = [];
        foreach (static::exportMeta($this->publicAttributeItems) as $attribute => $item) {
            $props = [];
            $type = \Yii::$app->types->getType($this->getAttributeEntity($attribute)->appType);

            // Add label and hint
            foreach (['label', 'hint'] as $key) {
                if (empty($item[$key])) {
                    continue;
                }

                $text = ArrayHelper::getValue($item, $key);
                if ($text) {
                    $props[$key] = $locale ? GiiHelper::locale($text) : $text;
                }
            }

            // Add other props
            $type->prepareFormatterProps($this->getClassName(), $attribute, $props);

            $result[$attribute] = $props;
        }

        return $result;
    }

    /**
     * @param string $indent
     * @param array $import
     * @return mixed|string
     * @throws \ReflectionException
     */
    public function renderJsFormatters($indent = '', &$import = [])
    {
        return $this->jsExport($this->getJsFormatters(true), $indent, $import);
    }

    /**
     * @param $result
     * @param string $indent
     * @param array $import
     * @return mixed|string
     * @throws \ReflectionException
     */
    protected function jsExport($result, $indent = '', &$import = [])
    {
        $toReplace1 = [];
        $toReplace2 = [];

        // Detect class names for import
        foreach (GiiHelper::findClassNamesInMeta($result) as $key => $className) {
            $info = (new \ReflectionClass($className));
            $infoParent = $info->getParentClass();
            $name = $infoParent->getName();
            if (strpos($name, 'app\\') === 0) {
                $path = str_replace('\\', '/', $infoParent->getName());
            } else {
                $path = GiiHelper::getRelativePath($infoParent->getFileName(), $infoParent->getFileName());
                $path = preg_replace('/\.php$/', '', $path);
            }

            $import[] = "import {$info->getShortName()} from '" . $path . "';";

            $toReplace1[] = "'$key'";
            $toReplace2[] = $info->getShortName();
        }

        $code = GiiHelper::varJsExport($result, $indent);
        $code = str_replace($toReplace1, $toReplace2, $code);

        return $code;
    }

    /**
     * @param ModelAttributeEntity[] $attributeEntries
     * @param $useClasses
     * @return array
     */
    public static function exportMeta($attributeEntries, &$useClasses = [])
    {
        $meta = [];
        foreach ($attributeEntries as $attributeEntry) {
            $meta[$attributeEntry->name] = [];

            $properties = array_merge(
                $attributeEntry->getAttributes(),
                $attributeEntry->getCustomProperties()
            );
            foreach ($properties as $key => $value) {
                // Skip defaults
                if ($key === 'appType' && $value === 'string') {
                    continue;
                }
                if ($key === 'stringType' && $value === 'text') {
                    continue;
                }
                if ($key === 'isRequired' && $value === false) {
                    continue;
                }

                // Skip array key
                if ($key === 'name' || $key === 'prevName' || $key === 'isProtected') {
                    continue;
                }

                // Skip service postgres-specific key
                if ($key === 'customMigrationColumnType') {
                    continue;
                }

                // Skip self link
                if ($key === 'modelEntity') {
                    continue;
                }

                // Skip null values
                if ($value === '' || $value === null) {
                    continue;
                }

                // Items process
                if ($key === 'items') {
                    $value = static::exportMeta($value, $useClasses);
                }

                $meta[$attributeEntry->name][$key] = $value;
            }
        }
        return $meta;
    }

    public function renderRules(&$useClasses = [])
    {
        return static::exportRules($this->publicAttributeItems, $this->publicRelationItems, $useClasses);
    }

    /**
     * @param ModelAttributeEntity[] $attributeEntities
     * @param ModelRelationEntity[] $relationEntities
     * @param array $useClasses
     * @return array
     */
    public static function exportRules($attributeEntities, $relationEntities, &$useClasses = [])
    {
        $types = [];
        foreach ($attributeEntities as $attributeEntity) {
            $type = \Yii::$app->types->getType($attributeEntity->appType);
            if (!$type) {
                continue;
            }

            $rules = $type->giiRules($attributeEntity, $useClasses) ?: [];
            foreach ($rules as $rule) {
                /** @var array $rule */
                $attributes = (array)ArrayHelper::remove($rule, 0);
                $name = ArrayHelper::remove($rule, 1);
                $validatorRaw = GiiHelper::varExport($name);
                if (!empty($rule)) {
                    $validatorRaw .= ', ' . substr(GiiHelper::varExport($rule, '', true), 1, -1);
                }

                foreach ($attributes as $attribute) {
                    $types[$validatorRaw][] = $attribute;
                }
            }

            if ($attributeEntity->isRequired) {
                $types["'required'"][] = $attributeEntity->name;
            }
        }

        $rules = [];
        foreach ($types as $validatorRaw => $attributes) {
            $attributesRaw = "'" . implode("', '", $attributes) . "'";
            if (count($attributes) > 1) {
                $attributesRaw = "[$attributesRaw]";
            }

            $rules[] = "[$attributesRaw, $validatorRaw]";
        }

        return $rules;
    }

    public function renderBehaviors($indent = '', &$useClasses = [])
    {
        return static::exportBehaviors($this->publicAttributeItems, $indent, $useClasses);
    }

    public function renderSortFields($indent = '')
    {
        $attributes = [];
        foreach ($this->attributeItems as $item) {
            if ($item->isSortable) {
                $attributes[] = $item->name;
            }
        }
        return GiiHelper::varExport($attributes, $indent);
    }

    /**
     * @param ModelAttributeEntity[] $attributeEntities
     * @param string $indent
     * @param array $useClasses
     * @return string
     */
    public static function exportBehaviors($attributeEntities, $indent = '', &$useClasses = [])
    {
        $behaviors = [];
        foreach ($attributeEntities as $attributeEntity) {
            $appType = \Yii::$app->types->getType($attributeEntity->appType);
            if (!$appType) {
                continue;
            }

            foreach ($appType->giiBehaviors($attributeEntity) as $behaviour) {
                if (is_string($behaviour)) {
                    $behaviour = ['class' => $behaviour];
                }

                $className = ArrayHelper::remove($behaviour, 'class');
                if (!isset($behaviors[$className])) {
                    $behaviors[$className] = [];
                }
                $behaviors[$className] = ArrayHelper::merge($behaviors[$className], $behaviour);
            }
        }
        if (empty($behaviors)) {
            return '';
        }

        $items = [];
        foreach ($behaviors as $className => $params) {
            $nameParts = explode('\\', $className);
            $name = array_slice($nameParts, -1)[0];
            $useClasses[] = $className;

            if (empty($params)) {
                $items[] = "$name::class,";
            } else {
                $params = array_merge([
                    'class' => new ValueExpression("$name::class"),
                ], $params);
                $items[] = GiiHelper::varExport($params, $indent) . ",";
            }
        }
        return implode("\n" . $indent, $items) . "\n";
    }

    public function getPhpDocProperties()
    {
        $properties = [];
        foreach ($this->publicAttributeItems as $attributeEntity) {
            if ($attributeEntity->getDbType()) {
                $properties[$attributeEntity->name] = $attributeEntity->getPhpDocType();
            }
        }
        return $properties;
    }

    public function getProperties()
    {
        $properties = [];
        foreach ($this->publicAttributeItems as $attributeEntity) {
            $appType = \Yii::$app->types->getType($attributeEntity->appType);
            if (!$appType) {
                continue;
            }

            if ($appType instanceof RelationType && $attributeEntity->modelEntity instanceof ModelEntity && !$appType->giiDbType($attributeEntity)) {
                $relation = $attributeEntity->modelEntity->getRelationEntity($attributeEntity->relationName);
                $properties[$attributeEntity->name] = $relation && !$relation->isHasOne ? '[]' : null;
            }
        }
        return $properties;
    }

    public function getRequestParamName()
    {
        /** @var Model $className */
        $className = $this->getClassName();
        return $className::getRequestParamName();
    }

    public function getCanRules()
    {
        $names = [];
        $methods = (new \ReflectionClass($this->getClassName()))->getMethods();
        foreach ($methods as $method) {
            if ($method->isPublic() && $method->getNumberOfRequiredParameters() === 1
                && strpos($method->name, 'can') === 0 && $method->getParameters()[0]->name === 'user') {
                $names[] = lcfirst(substr($method->name, 3));
            }
        }
        return $names;
    }
}
