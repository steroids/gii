<?php

namespace app\views;

use steroids\gii\generators\crud\CrudGenerator;
use steroids\gii\models\ControllerClass;
use yii\web\View;

/* @var $crudEntity ControllerClass */

echo "<?php\n";
?>

namespace <?= $crudEntity->namespace ?>;

use <?= $crudEntity->metaClass->className ?>;

class <?= $crudEntity->name ?> extends <?= $crudEntity->metaClass->name . "\n" ?>
{
}
