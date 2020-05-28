<?php

namespace app\views;

use steroids\gii\forms\BackendEnumEntity;

/* @var $enumEntity BackendEnumEntity */

echo "<?php\n";
?>

namespace <?= $enumEntity->getNamespace() ?>;

use <?= $enumEntity->getNamespace() ?>\meta\<?= $enumEntity->name ?>Meta;

class <?= $enumEntity->name ?> extends <?= $enumEntity->name . "Meta\n" ?>
{
}
