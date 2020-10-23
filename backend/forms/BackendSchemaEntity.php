<?php

namespace steroids\gii\forms;

use steroids\core\base\BaseSchema;
use steroids\core\helpers\ClassFile;
use steroids\gii\forms\meta\BackendSchemaEntityMeta;
use steroids\gii\traits\EntityTrait;

class BackendSchemaEntity extends BackendSchemaEntityMeta implements EntityInterface
{
    use EntityTrait;

    /**
     * @var ClassFile
     */
    public $classFile;

    /**
     * @var string
     */
    public $moduleId;

    /**
     * @inheritDoc
     */
    public static function findOne(ClassFile $classFile)
    {
        $className = $classFile->className;
        if (!is_subclass_of($className, BaseSchema::class)) {
            return null;
        }

        return static::findOrCreate($classFile);
    }

    /**
     * @inheritDoc
     */
    public static function findOrCreate(ClassFile $classFile)
    {
        return new static([
            'classFile' => $classFile,
            'namespace' => $classFile->namespace,
            'name' => $classFile->name,
        ]);
    }
}
