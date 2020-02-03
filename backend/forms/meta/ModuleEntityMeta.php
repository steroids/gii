<?php

namespace steroids\gii\forms\meta;

use steroids\core\base\FormModel;
use \Yii;

abstract class ModuleEntityMeta extends FormModel
{
    public $id;

    public function rules()
    {
        return [
            ['id', 'string', 'max' => 255],
            ['id', 'required'],
        ];
    }

    public static function meta()
    {
        return [
            'id' => [
                'label' => Yii::t('steroids', 'Module Id'),
                'isRequired' => true
            ]
        ];
    }
}
