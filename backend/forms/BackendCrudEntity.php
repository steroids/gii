<?php

namespace steroids\gii\forms;

use ReflectionException;
use steroids\core\base\CrudApiController;
use steroids\core\base\SearchModel;
use steroids\core\helpers\ClassFile;
use steroids\gii\enums\ClassType;
use steroids\gii\forms\meta\BackendCrudEntityMeta;
use steroids\gii\helpers\GiiHelper;
use steroids\gii\traits\EntityTrait;
use Throwable;
use Yii;
use yii\helpers\ArrayHelper;
use yii\helpers\Inflector;

/**
 * @property array $actionControls
 * @property BackendCrudItemEntity[] $items
 */
class BackendCrudEntity extends BackendCrudEntityMeta implements EntityInterface
{
    use EntityTrait;

    const MODEL_FIELDS = 'showInTable';
    const MODEL_DETAIL_FIELDS = 'showInView';
    const MODEL_FORM_FIELDS = 'showInForm';

    /**
     * @var ClassFile
     */
    public $classFile;

    /**
     * @var string
     */
    public $moduleId;

    /**
     * @param string $attributeName
     * @return array
     */
    public function getModelFields($attributeName)
    {
        $fields = [];
        if (!$this->items) {
            return [];
        }

        foreach ($this->items as $modelAttribute) {
            if ($modelAttribute->$attributeName) {
                $fields[] = $modelAttribute->name;
            }
        }
        return $fields;
    }

    /**
     * @return array
     */
    public function getActionControls()
    {
        return array_filter([
            $this->createActionIndex ? 'index' : null,
            $this->createActionCreate ? 'create' : null,
            $this->createActionUpdate ? 'update' : null,
            $this->createActionView ? 'view' : null,
            $this->createActionUpdateBatch ? 'update-batch' : null,
            $this->createActionDelete ? 'delete' : null,
        ]);
    }

    /**
     * @param array $controls
     */
    public function setActionControls($controls)
    {
        foreach ($controls as $control) {
            $property = 'createAction';
            if (strpos($control, '-') !== false) {
                $property .= Inflector::id2camel($control);
            } else {
                $property .= ucfirst($control);
            }
            if ($this->hasProperty($property)) {
                $this->$property = true;
            }
        }
    }

    /**
     * @return static[]
     */
    public static function findAll()
    {
        $items = [];
        foreach (GiiHelper::getModulesClasses(ClassType::CRUD) as $classFile) {
            $items[] = new static([
                'classFile' => $classFile,
                'namespace' => $classFile->namespace,
                'name' => $classFile->name,
            ]);
        }

        ArrayHelper::multisort($items, 'classFile.name');
        return $items;
    }

    public function fields()
    {
        return array_merge(
            $this->attributes(),
            [
                'items',
                'id',
                'type',
            ]
        );
    }

    public function save()
    {
        if ($this->validate()) {
            // Lazy create module
            BackendModuleEntity::autoCreateForEntity($this);

            // Create/update meta information
            GiiHelper::renderFile('crud/meta', $this->getMetaPath(), [
                'crudEntity' => $this,
            ]);
            Yii::$app->session->addFlash('success', 'Meta info ' . $this->classFile->name . 'Meta updated');

            // Create controller, if not exists
            if (!file_exists($this->classFile->path)) {
                GiiHelper::renderFile('crud/controller', $this->classFile->path, [
                    'crudEntity' => $this,
                ]);
                Yii::$app->session->addFlash('success', 'Added controller ' . $this->classFile->name);
            }

            return true;
        }
        return false;
    }

    public function getPath()
    {
        return "{$this->classFile->moduleDir}/controllers/{$this->classFile->name}.php";
    }

    public function getMetaPath()
    {
        return "{$this->classFile->moduleDir}/controllers/meta/{$this->getControllerName()}MetaController.php";
    }

    public function getControllerId()
    {
        return preg_replace('/-controller$/', '', Inflector::camel2id($this->classFile->name));
    }

    /**
     * Return name of controller in CameCase style without `Controller` suffix
     * @return string
     */
    public function getControllerName()
    {
        return Inflector::id2camel($this->getControllerId(),'-');
    }

    public function getRoutePrefix()
    {
        $modulePrefix = str_replace('.', '/', $this->classFile->moduleId);
        return "/$modulePrefix/{$this->getControllerId()}";
    }

    public static function findOne(ClassFile $classFile)
    {
        $className = $classFile->className;
        if (!is_subclass_of($className, CrudApiController::class)) {
            return null;
        }

        return static::findOrCreate($classFile);
    }

    /**
     * @param ClassFile $classFile
     * @return EntityInterface|static
     * @throws ReflectionException
     */
    public static function findOrCreate(ClassFile $classFile)
    {
        $entity = new static([
            'classFile' => $classFile,
            'namespace' => $classFile->namespace,
            'name' => $classFile->name,
            'moduleId' => $classFile->moduleId,
            'typeController' => 'crud',
        ]);

        /** @var SearchModel $searchModel */
        $className = $classFile->className;
        if (class_exists($className)) {
            if (property_exists($className, 'modelClass')) {
                $entity->queryModel = $classFile->reflection->getStaticPropertyValue('modelClass');
            }

            if (property_exists($className, 'searchModelClass')) {
                $entity->searchModel = $classFile->reflection->getStaticPropertyValue('searchModelClass');
            }

            if (property_exists($className, 'viewSchema')) {
                $entity->viewSchema = $classFile->reflection->getStaticPropertyValue('viewSchema');
            }

            if (method_exists($className, 'controls')) {
                $entity->actionControls = $className::controls();
            }

            if ($entity->queryModel && !$entity->searchModel) {
                $entity->populateRelation('items', BackendCrudItemEntity::findAll($entity));
            }
        }

        return $entity;
    }
}
