<?php

namespace app\views;

use steroids\gii\forms\BackendBackendEnumEntity;

/* @var $enumEntity BackendBackendEnumEntity */

echo "<?php\n";
?>

namespace <?= $enumEntity->getNamespace() ?>;

use <?= $enumEntity->getNamespace() ?>\meta\<?= $enumEntity->name ?>Meta;

class <?= $enumEntity->name ?> extends <?= $enumEntity->name . "Meta\n" ?>
{
}
