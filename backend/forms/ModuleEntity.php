<?php

namespace steroids\gii\forms;

use steroids\core\helpers\ClassFile;
use steroids\helpers\DefaultConfig;
use steroids\gii\forms\meta\ModuleEntityMeta;
use steroids\gii\helpers\GiiHelper;
use yii\helpers\ArrayHelper;

class ModuleEntity extends ModuleEntityMeta
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
        foreach (GiiHelper::getModules() as $classFile) {
            $items[] = new static([
                'classFile' => $classFile,
            ]);
        }

        ArrayHelper::multisort($items, 'name');
        return $items;
    }

    /**
     * @param EntityInterface $entity
     * @return static
     * @throws \Exception
     */
    public static function autoCreateForEntity($entity)
    {
        if (strpos(ltrim($entity->classFile->className, '\\'), STEROIDS_APP_NAMESPACE . '\\') !== 0) {
            return;
        }

        $entity = new static(['id' => $entity->classFile->moduleId]);
        $entity->save();
    }

    public function save()
    {
        if ($this->validate()) {
            $ids = [];
            foreach (explode('.', $this->classFile->moduleId) as $subId) {
                $ids[] = $subId;
                $name = ucfirst($subId) . 'Module';
                $path = \Yii::getAlias('@app') . '/' . implode('/', $ids) . '/' . $name . '.php';

                if (!file_exists($path)) {
                    GiiHelper::renderFile('module/module', $path, [
                        'moduleEntity' => $this,
                        'name' => $name,
                        'namespace' => 'app\\' . implode('\\', $ids),
                    ]);
                }
                \Yii::$app->session->addFlash('success', 'Added module ' . $name);
            }

            return true;
        }
        return false;
    }

    public function getName()
    {
        return $this->classFile->name;
    }
}
