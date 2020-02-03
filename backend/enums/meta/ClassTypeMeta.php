<?php

namespace steroids\gii\enums\meta;

use Yii;
use steroids\core\base\Enum;

abstract class ClassTypeMeta extends Enum
{
    const MODEL = 'model';
    const FORM = 'form';
    const ENUM = 'enum';
    const CRUD = 'crud';
    const MODULE = 'module';

    public static function getLabels()
    {
        return [
            self::MODEL => Yii::t('app', 'Model ActiveRecord'),
            self::FORM => Yii::t('app', 'Model Form'),
            self::ENUM => Yii::t('app', 'Enum'),
            self::CRUD => Yii::t('app', 'Crud Controller'),
            self::MODULE => Yii::t('app', 'Module')
        ];
    }

    public static function getDirData()
    {
        return [
            self::MODEL => 'models',
            self::FORM => 'forms',
            self::ENUM => 'enums',
            self::CRUD => 'controllers'
        ];
    }

    public static function getDir($id)
    {
        return static::getDataValue('dir', $id);
    }
}
