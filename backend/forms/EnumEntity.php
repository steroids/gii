<?php

namespace steroids\gii\forms;

use steroids\core\base\Enum;
use steroids\core\helpers\ClassFile;
use steroids\gii\enums\ClassType;
use steroids\gii\forms\meta\EnumEntityMeta;
use steroids\gii\GiiModule;
use steroids\gii\helpers\GiiHelper;
use steroids\gii\models\ValueExpression;
use steroids\gii\traits\EntityTrait;
use yii\helpers\ArrayHelper;

class EnumEntity extends EnumEntityMeta
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
        foreach (GiiHelper::getModulesClasses(ClassType::ENUM) as $classFile) {
            $items[] = static::findOne($classFile);
        }

        ArrayHelper::multisort($items, ['classFile.moduleId', 'classFile.name']);
        return $items;
    }

    public static function findOne(ClassFile $classFile)
    {
        $className = $classFile->className;
        if (!is_subclass_of($className, Enum::class)) {
            return null;
        }

        $entity = new static([
            'classFile' => $classFile,
            'namespace' => $classFile->namespace,
            'name' => $classFile->name,
        ]);
        $entity->populateRelation('items', EnumItemEntity::findAll($entity));
        return $entity;
    }

    public function fields()
    {
        return [
            'namespace',
            'name',
            'className' => function(EnumEntity $entity) {
                return $entity->classFile->className;
            },
            'customColumns',
            'items',
        ];
    }

    public function save()
    {
        if ($this->validate()) {
            // Lazy create module
            ModuleEntity::autoCreateForEntity($this);

            // Create/update meta information
            GiiHelper::renderFile('enum/meta', $this->getMetaPath(), [
                'enumEntity' => $this,
            ]);
            if (GiiModule::getInstance()->generateJsMeta) {
                GiiHelper::renderFile('enum/meta_js', $this->getMetaJsPath(), [
                    'enumEntity' => $this,
                ]);
            }
            \Yii::$app->session->addFlash('success', 'Meta info enum ' . $this->classFile->name . 'Meta updated');

            // Create enum, if not exists
            if (!file_exists($this->getPath())) {
                GiiHelper::renderFile('enum/enum', $this->getPath(), [
                    'enumEntity' => $this,
                ]);
                \Yii::$app->session->addFlash('success', 'Added enum ' . $this->classFile->name);
            }

            return true;
        }
        return false;
    }

    public function getClassName()
    {
        return $this->classFile->className;
    }

    public function getPath()
    {
        return "{$this->classFile->moduleDir}/enums/{$this->classFile->name}.php";
    }

    public function getMetaPath()
    {
        return "{$this->classFile->moduleDir}/enums/meta/{$this->classFile->name}Meta.php";
    }

    public function getMetaJsPath()
    {
        return "{$this->classFile->moduleDir}/enums/meta/{$this->classFile->name}Meta.js";
    }

    /**
     * @param string $indent
     * @return mixed|string
     */
    public function renderLabels($indent = '')
    {
        $category = strpos('steroids\\', $this->getClassName()) === 0 ? 'steroids' : 'app';
        $labels = [];
        foreach ($this->items as $itemEntity) {
            $labels[] = new ValueExpression(
                'self::' . $itemEntity->getConstName() . ' => Yii::t(\'' . $category . '\', ' . GiiHelper::varExport($itemEntity->label) . ')'
            );
        }
        return GiiHelper::varExport($labels, $indent);
    }

    /**
     * @param string $indent
     * @return mixed|string
     */
    public function renderJsLabels($indent = '')
    {
        $lines = [];
        foreach ($this->items as $itemEntity) {
            $lines[] = $indent . '    [this.' . $itemEntity->getConstName() . ']: '
                . '__(' . GiiHelper::varExport($itemEntity->label) . '),';
        }
        return "{\n" . implode("\n", $lines) . "\n" . $indent . '}';
    }

    /**
     * @param string $indent
     * @return mixed|string
     */
    public function renderCssClasses($indent = '')
    {
        $cssClasses = [];
        foreach ($this->items as $itemEntity) {
            if ($itemEntity->cssClass) {
                $cssClasses[] = new ValueExpression('self::' . $itemEntity->getConstName() . ' => ' . GiiHelper::varExport($itemEntity->cssClass));
            }
        }
        return !empty($cssClasses) ? GiiHelper::varExport($cssClasses, $indent) : '';
    }

    /**
     * @return string[]
     */
    public function getCustomColumns()
    {
        $columns = [];
        if (!empty($this->items) && is_array($this->items[0]->custom)) {
            foreach ($this->items[0]->custom as $name => $value) {
                $columns[] = $name;
            }
        }
        return $columns;
    }

    /**
     * @param string $name
     * @param string $indent
     * @return mixed|string
     */
    public function renderCustomColumn($name, $indent = '')
    {
        $values = [];
        foreach ($this->items as $itemEntity) {
            if (isset($itemEntity->custom[$name])) {
                $values[] = new ValueExpression(
                    'self::' . $itemEntity->getConstName() . ' => ' . GiiHelper::varExport($itemEntity->custom[$name]) . ''
                );
            }
        }
        return GiiHelper::varExport($values, $indent);
    }

    /**
     * @param string $indent
     * @return mixed|string
     */
    public function renderJsCssClasses($indent = '')
    {
        $lines = [];
        foreach ($this->items as $itemEntity) {
            if ($itemEntity->cssClass) {
                $lines[] = $indent . '    [this.' . strtoupper($itemEntity->name) . ']: '
                    . '\'' . str_replace("'", "\\'", $itemEntity->cssClass) . '\',';
            }
        }
        return !empty($lines) ? "{\n" . implode("\n", $lines) . "\n" . $indent . '}' : '';
    }

    /**
     * @param string $indent
     * @return mixed|string
     */
    public function renderCustomColumnJs($name, $indent = '')
    {
        $lines = [];
        foreach ($this->items as $itemEntity) {
            if (isset($itemEntity->custom[$name])) {
                $lines[] = $indent . '    [this.' . strtoupper($itemEntity->name) . ']: '
                    . '\'' . str_replace("'", "\\'", $itemEntity->custom[$name]) . '\',';
            }
        }
        return "{\n" . implode("\n", $lines) . "\n" . $indent . '}';
    }

}
