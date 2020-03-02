<?php

namespace steroids\gii\forms;

use steroids\core\helpers\ClassFile;

/**
 * @property-read bool $isProtected
 */
class BackendFormRelationEntity extends BackendModelRelationEntity
{
    /**
     * @return BackendModelEntity|null
     */
    public function getRelationModelEntry()
    {
        return BackendFormEntity::findOne(ClassFile::createByClass($this->relationModel, ClassFile::TYPE_FORM));
    }
}
