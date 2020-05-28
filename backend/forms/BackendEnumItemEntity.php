<?php

namespace steroids\gii\forms;

use steroids\core\base\Enum;
use steroids\gii\enums\ClassType;
use steroids\gii\forms\meta\BackendEnumItemEntityMeta;
use steroids\gii\helpers\GiiHelper;
use yii\helpers\ArrayHelper;

class BackendEnumItemEntity extends BackendEnumItemEntityMeta
{
    /**
     * @param BackendEnumEntity $entity
     * @return static[]
     * @throws \ReflectionException
     */
    public static function findAll($entity)
    {
        /** @var Enum $enumClass */
        $enumClass = $entity->classFile->className;

        $info = new \ReflectionClass($enumClass);
        $constants = $info->getConstants();

        $customLists = [];
        foreach ($info->getMethods() as $method) {
            if ($method->getNumberOfParameters() === 0 && preg_match('/^get(.+)Data$/', $method->name, $match)) {
                $columnName = lcfirst($match[1]);
                $methodName = $method->name;
                $customLists[$columnName] = $enumClass::$methodName();
            }
        }

        $items = [];
        $cssClasses = $enumClass::getCssClasses();
        foreach ($enumClass::getLabels() as $value => $label) {
            $name = strtolower(array_search($value, $constants));
            $item = new static([
                'name' => $name,
                'value' => $name !== $value ? $value : null,
                'label' => $label,
                'cssClass' => ArrayHelper::getValue($cssClasses, $value),
            ]);

            $custom = [];
            foreach ($customLists as $columnName => $values) {
                $custom[$columnName] = ArrayHelper::getValue($values, $value);
            }
            $item->custom = $custom;

            $items[] = $item;
        }

        return $items;
    }

    public function fields()
    {
        return $this->attributes();
    }

    public function getConstName() {
        return strtoupper($this->name);
    }

    public function renderConstValue() {
        if ($this->value) {
            return is_numeric($this->value) ? $this->value :  "'" . $this->value . "'";
        }
        return "'" . strtolower($this->name) . "'";
    }

}
