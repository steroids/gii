<?php

namespace steroids\gii\enums;

use steroids\gii\enums\meta\ClassTypeMeta;
use steroids\gii\forms\CrudEntity;
use steroids\gii\forms\EnumEntity;
use steroids\gii\forms\FormEntity;
use steroids\gii\forms\ModelEntity;

class ClassType extends ClassTypeMeta
{
    /**
     * @param $id
     * @return string
     */
    public static function getEntityClass($id)
    {
        $map = [
            self::MODEL => ModelEntity::class,
            self::FORM => FormEntity::class,
            self::ENUM => EnumEntity::class,
            self::CRUD => CrudEntity::class,
        ];
        return $map[$id];
    }
}
