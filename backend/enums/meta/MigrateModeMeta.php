<?php

namespace steroids\gii\enums\meta;

use Yii;
use steroids\core\base\Enum;

abstract class MigrateModeMeta extends Enum
{
    const UPDATE = 'update';
    const CREATE = 'create';
    const NONE = 'none';

    public static function getLabels()
    {
        return [
            self::UPDATE => Yii::t('steroids', 'Update'),
            self::CREATE => Yii::t('steroids', 'Create'),
            self::NONE => Yii::t('steroids', 'None')
        ];
    }
}
