<?php

namespace steroids\gii\enums;

use steroids\gii\enums\meta\ClassTypeMeta;
use steroids\gii\forms\BackendCrudEntity;
use steroids\gii\forms\BackendBackendEnumEntity;
use steroids\gii\forms\BackendFormEntity;
use steroids\gii\forms\BackendModelEntity;
use steroids\gii\forms\BackendModuleEntity;

class ClassType extends ClassTypeMeta
{
    /**
     * @param $id
     * @return string
     */
    public static function getEntityClass($id)
    {
        $map = [
            self::MODEL => BackendModelEntity::class,
            self::FORM => BackendFormEntity::class,
            self::ENUM => BackendBackendEnumEntity::class,
            self::CRUD => BackendCrudEntity::class,
            self::MODULE => BackendModuleEntity::class,
        ];
        return $map[$id];
    }
}
