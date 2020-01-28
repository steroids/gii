<?php

namespace steroids\gii\forms;

use steroids\core\helpers\ClassFile;
use steroids\gii\enums\ClassType;
use steroids\gii\forms\meta\CrudEntityMeta;
use steroids\gii\helpers\GiiHelper;
use yii\helpers\ArrayHelper;
use yii\helpers\Inflector;

class CrudEntity extends CrudEntityMeta
{
    /**
     * @var ClassFile
     */
    public $classFile;

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
            ]
        );
    }

    public function save()
    {
        if ($this->validate()) {
            // Lazy create module
            ModuleEntity::autoCreateForEntity($this);

            // Create/update meta information
            GiiHelper::renderFile('crud/meta', $this->getMetaPath(), [
                'crudEntity' => $this,
            ]);
            \Yii::$app->session->addFlash('success', 'Meta info ' . $this->classFile->name . 'Meta updated');

            // Create controller, if not exists
            if (!file_exists($this->getPath())) {
                GiiHelper::renderFile('crud/controller', $this->getPath(), [
                    'crudEntity' => $this,
                ]);
                \Yii::$app->session->addFlash('success', 'Added controller ' . $this->classFile->name);
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
        return "{$this->classFile->moduleDir}/controllers/meta/{$this->classFile->name}Meta.php";
    }

    public function getControllerId()
    {
        return preg_replace('/-controller$/', '', Inflector::camel2id($this->classFile->name));
    }

    public function getRoutePrefix()
    {
        $modulePrefix = str_replace('.', '/', $this->classFile->moduleId);
        return "/$modulePrefix/{$this->getControllerId()}";
    }
}
