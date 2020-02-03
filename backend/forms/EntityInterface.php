<?php

namespace steroids\gii\forms;

use steroids\core\helpers\ClassFile;

/**
 * Interface EntityInterface
 * @package steroids\gii\forms
 * @property-read ClassFile $classFile
 */
interface EntityInterface
{
    /**
     * @param ClassFile $classFile
     * @return static|null
     */
    public static function findOne(ClassFile $classFile);

    /**
     * @param ClassFile $classFile
     * @return static
     */
    public static function findOrCreate(ClassFile $classFile);
}