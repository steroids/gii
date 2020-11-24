<?php

namespace steroids\gii\forms;

use ReflectionClass;
use ReflectionException;
use steroids\core\base\CrudApiController;
use steroids\gii\forms\meta\BackendCrudItemEntityMeta;

class BackendCrudItemEntity extends BackendCrudItemEntityMeta
{
    /**
     * @param BackendCrudEntity $crudEntity
     * @return static[]
     * @throws ReflectionException
     */
    public static function findAll($crudEntity)
    {
        $className = $crudEntity->classFile->className;
        $modelAttributes = [];

        /** @var CrudApiController $controller */
        $controller = new $className($crudEntity->classFile->name, $crudEntity->classFile->moduleId);
        $reflection = new ReflectionClass($controller::$modelClass);

        if ($reflection->hasMethod('meta')) {
            $meta = $controller::$modelClass::meta();
            foreach ($meta as $attributeName => $attribute) {
                $hasFormFields = $controller->hasMethod('formFields');
                $modelAttributes[] = new static([
                    'name' => $attributeName,
                    'showInForm' => $hasFormFields ? in_array($attributeName, $controller->formFields() ?: []) : false,
                    'showInTable' => in_array($attributeName, $controller->fields() ?: []),
                    'showInView' => in_array($attributeName, $controller->detailFields() ?: []),
                    'isSortable' => false,
                ]);
            }
        }

        return $modelAttributes;
    }

    public function fields()
    {
        return $this->attributes();
    }
}
