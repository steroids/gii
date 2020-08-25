<?php

namespace app\views;

use steroids\gii\forms\BackendCrudEntity;
use yii\web\View;

/**
 * @var View $this
 * @var BackendCrudEntity $crudEntity
 */

$metaControllerName = $crudEntity->getControllerName() . 'MetaController';

echo "<?php\n";
?>

namespace <?= $crudEntity->classFile->namespace ?>;

use <?= $crudEntity->classFile->namespace ?>\meta\<?= $metaControllerName ?>;

class <?= $crudEntity->classFile->name ?> extends <?= $metaControllerName . "\n" ?>
{
}
