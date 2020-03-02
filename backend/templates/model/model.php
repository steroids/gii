<?php

namespace app\views;

use steroids\gii\forms\BackendModelEntity;

/* @var $modelEntity BackendModelEntity */

echo "<?php\n";
?>

namespace <?= $modelEntity->getNamespace() ?>;

use <?= $modelEntity->getNamespace() ?>\meta\<?= $modelEntity->name ?>Meta;

class <?= $modelEntity->name ?> extends <?= $modelEntity->name . "Meta\n" ?>
{
}
