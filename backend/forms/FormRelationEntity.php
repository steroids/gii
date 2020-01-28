<?php

namespace steroids\gii\forms;

use steroids\core\helpers\ClassFile;

/**
 * @property-read bool $isProtected
 */
class FormRelationEntity extends ModelRelationEntity
{
    /**
     * @return ModelEntity|null
     */
    public function getRelationModelEntry()
    {
        return FormEntity::findOne(ClassFile::createByClass($this->relationModel));
    }
}
