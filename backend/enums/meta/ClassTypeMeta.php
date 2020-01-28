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

    public static function getLabels()
    {
        return [
            self::MODEL => Yii::t('steroids', 'Model ActiveRecord'),
            self::FORM => Yii::t('steroids', 'Model Form'),
            self::ENUM => Yii::t('steroids', 'Enum'),
            self::CRUD => Yii::t('steroids', 'Crud Controller'),
        ];
    }

    public static function getDirData()
    {
        return [
            self::MODEL => 'models',
            self::FORM => 'forms',
            self::ENUM => 'enums',
            self::CRUD => 'controllers',
        ];
    }

    public static function getDir($id)
    {
        return static::getDataValue('dir', $id);
    }
}
