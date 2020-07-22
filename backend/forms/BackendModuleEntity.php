<?php

namespace steroids\gii\forms;

use steroids\core\helpers\ClassFile;
use steroids\core\helpers\ModuleHelper;
use steroids\gii\forms\meta\BackendModuleEntityMeta;
use steroids\gii\helpers\GiiHelper;
use yii\base\Module;
use yii\helpers\ArrayHelper;

class BackendModuleEntity extends BackendModuleEntityMeta
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

    public static function findOne(ClassFile $classFile)
    {
        if (!is_subclass_of($classFile->className, Module::class)) {
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
        return new static([
            'classFile' => $classFile,
            'id' => $classFile->moduleId,
        ]);
    }

    /**
     * @param EntityInterface $entity
     * @throws \Exception
     */
    public static function autoCreateForEntity($entity)
    {
        if (strpos(ltrim($entity->classFile->className, '\\'), STEROIDS_APP_NAMESPACE . '\\') !== 0) {
            return;
        }

        $classFile = ModuleHelper::resolveModule($entity->classFile->moduleDir);
        $moduleEntity = new static([
            'classFile' => $classFile,
            'id' => $classFile->moduleId,
        ]);
        $moduleEntity->save();
    }

    /**
     * @inheritDoc
     */
    public function rules()
    {
        return [
            ['id', 'filter', 'filter' => function ($value) {
                $ids = explode('.', $value);
                foreach ($ids as &$id) {
                    $id = preg_replace('/Module$/', '', lcfirst($id));
                }
                return implode('.', $ids);
            }],
        ];
    }

    public function save()
    {
        if ($this->validate()) {

            $ids = [];
            $path = null;
            foreach (explode('.', $this->id) as $id) {
                $ids[] = $id;
                $name = ucfirst($id) . 'Module';
                $path = \Yii::getAlias('@app') . '/' . implode('/', $ids) . '/' . $name . '.php';

                if (!file_exists($path)) {
                    GiiHelper::renderFile('module/module', $path, [
                        'moduleEntity' => $this,
                        'className' => $name,
                        'namespace' => 'app\\' . implode('\\', $ids),
                    ]);
                }
                \Yii::$app->session->addFlash('success', 'Added module ' . $name);
            }

            if (!$this->classFile) {
                $this->classFile = ModuleHelper::resolveModule(dirname($path));
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
