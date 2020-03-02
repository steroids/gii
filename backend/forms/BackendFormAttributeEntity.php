<?php

namespace steroids\gii\forms;

use steroids\core\base\FormModel;
use steroids\gii\enums\ClassType;
use yii\helpers\ArrayHelper;

/**
 * @property-read bool $isProtected
 */
class BackendFormAttributeEntity extends BackendModelAttributeEntity
{
    /**
     * @inheritdoc
     */
    public static function findAll($entity)
    {
        return parent::findAll($entity);
    }

}
