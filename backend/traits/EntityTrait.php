<?php

namespace steroids\gii\traits;

trait EntityTrait
{
    public function getId()
    {
        return str_replace('\\', '-', $this->classFile->className);
    }

    public function getType()
    {
        return $this->classFile->type;
    }

    public function getNamespace()
    {
        return substr($this->getClassName(), 0, -1 * (strlen($this->name) + 1));
    }
}