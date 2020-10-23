<?php

namespace steroids\gii\forms\meta;

use steroids\core\base\FormModel;
use \Yii;

abstract class BackendSchemaEntityMeta extends FormModel
{
    public $namespace;
    public $name;

    public function rules()
    {
        return [
            [['namespace', 'name'], 'string', 'max' => 255],
            [['namespace', 'name'], 'required'],
        ];
    }

    public static function meta()
    {
        return [
            'namespace' => [
                'label' => Yii::t('steroids', 'Namespace'),
                'required' => true
            ],
            'name' => [
                'label' => Yii::t('steroids', 'Class name'),
                'required' => true
            ],
        ];
    }
}
