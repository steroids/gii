<?php

namespace steroids\gii\controllers;

use steroids\core\helpers\ClassFile;
use steroids\core\helpers\ModuleHelper;
use steroids\gii\forms\ModuleEntity;
use steroids\gii\traits\EntityTrait;
use Yii;
use steroids\core\base\Type;
use steroids\gii\helpers\GiiHelper;
use steroids\gii\GiiModule;
use steroids\gii\enums\ClassType;
use steroids\gii\forms\CrudEntity;
use steroids\gii\forms\EnumEntity;
use steroids\gii\forms\FormEntity;
use steroids\gii\forms\ModelEntity;
use steroids\gii\models\AuthPermissionSync;
use yii\helpers\ArrayHelper;
use yii\helpers\StringHelper;
use yii\rbac\Permission;
use yii\web\BadRequestHttpException;
use yii\web\Controller;

class GiiController extends Controller
{
    public static function apiMap()
    {
        return [
            'gii' => [
                'visible' => false,
                'accessCheck' => [GiiModule::class, 'accessCheck'],
                'items' => [
                    'init' => '/api/gii/init',
                    'entity' => '/api/gii/entities/<type>/<namespace>/<name>',
                    'api-get-entities' => '/api/gii/get-entities',
                    'api-class-save' => '/api/gii/class-save',
                    'api-get-permissions' => '/api/gii/get-permissions',
                    'api-permissions-save' => '/api/gii/permissions-save',
                ],
            ],
        ];
    }

    public function beforeAction($action)
    {
        if ($action->id === 'init') {
            $this->enableCsrfValidation = false;
        }
        return parent::beforeAction($action);
    }

    public function actionInit()
    {
        AuthPermissionSync::syncModels();

        $applications = [];
        $entityTypes = [
            [
                'className' => EnumEntity::class,
                'label' => 'enums',
                'type' => ClassType::ENUM,
                'dir' => ClassType::getDir(ClassType::ENUM),
            ],
            [
                'className' => FormEntity::class,
                'label' => 'forms',
                'type' => ClassType::FORM,
                'dir' => ClassType::getDir(ClassType::FORM),
            ],
            [
                'className' => ModelEntity::class,
                'label' => 'models',
                'type' => ClassType::MODEL,
                'dir' => ClassType::getDir(ClassType::MODEL),
            ],
        ];

        // Backend + Steroids
        $groupedModules = [
            'backend' => ModuleHelper::findModules(STEROIDS_APP_DIR, STEROIDS_APP_NAMESPACE),
        ];
        if ($steroidsDevDir = GiiModule::getInstance()->steroidsDevDir) {
            $groupedModules['steroids'] = ModuleHelper::findModules($steroidsDevDir);
        }
        foreach ($groupedModules as $applicationLabel => $modules) {
            $applications[] = [
                'type' => 'application',
                'label' => $applicationLabel,
                'items' => array_map(
                    function (ClassFile $module) use ($entityTypes) {
                        $items = [];

                        foreach ($entityTypes as $entityType) {
                            $entities = [];

                            $classFiles = ModuleHelper::findModuleClasses($module, $entityType['type'], $entityType['dir']);
                            foreach ($classFiles as $classFile) {
                                $entity = $entityType['className']::findOne($classFile);
                                if ($entity) {
                                    $entities[] = $entity;
                                }
                            }

                            if (count($entities) > 0) {
                                $items[] = [
                                    'type' => 'directory',
                                    'label' => $entityType['label'],
                                    'items' => array_map(
                                        function ($entity) use ($entityType) {
                                            return [
                                                'type' => $entityType['type'],
                                                'label' => $entity->classFile->name,
                                                'namespace' => $entity->classFile->namespace,
                                                'className' => $entity->classFile->className,
                                                'name' => $entity->classFile->name,
                                            ];
                                        },
                                        $entities
                                    ),
                                ];
                            }
                        }

                        return [
                            'type' => 'module',
                            'label' => $module->moduleId,
                            'moduleId' => $module->moduleId,
                            'namespace' => $module->namespace,
                            'items' => $items,
                        ];
                    },
                    $modules
                ),
            ];
        }

        // Frontend
        foreach (GiiModule::getInstance()->frontendDirs as $frontendDir) {
            $applications[] = [
                'type' => 'frontend',
                'label' => StringHelper::basename($frontendDir),
            ];
        }

        return [
            'config' => [
                'http' => [
                    'csrfToken' => Yii::$app->request->csrfToken,
                ],
                'locale' => [
                    'language' => Yii::$app->language,
                ],
            ],
            'meta' => Yii::$app->types->getFrontendMeta(
                \Yii::$app->request->post('models'),
                \Yii::$app->request->post('enums')
            ),
            'applications' => $applications,
            'types' => array_map(
                function (Type $appType) {
                    $additionalFields = $appType->giiOptions();
                    return [
                        'name' => $appType->name,
                        'title' => ucfirst($appType->name),
                        'additionalFields' => !empty($additionalFields) ? $additionalFields : null,
                    ];
                },
                \Yii::$app->types->getTypes()
            ),
        ];
    }

    public function actionEntity($type, $namespace, $name)
    {
        /** @var EnumEntity|FormEntity|ModelEntity|ModuleEntity $entityClass */
        $entityClass = ClassType::getEntityClass($type);

        $namespace = str_replace('-', '\\', $namespace);
        $className = $namespace . '\\' . $name;
        $classFile = class_exists($className)
            ? ClassFile::createByClass($namespace . '\\' . $name)
            : ClassFile::createByNamespace($namespace, $name);

        $entity = class_exists($className)
            ? $entityClass::findOne($classFile)
            : new $entityClass([
                'classFile' => $classFile,
                'namespace' => $classFile->namespace,
                'name' => $classFile->name,
            ]);
        if (Yii::$app->request->isPost) {
            switch ($type) {
                case ClassType::MODEL:
                case ClassType::FORM:
                    $entity->listenRelationData('attributeItems');
                    $entity->listenRelationData('relationItems');
                    break;

                case ClassType::CRUD:
                case ClassType::ENUM:
                    $entity->listenRelationData('items');
                    break;
            }

            if ($entity->load(\Yii::$app->request->post())) {
                $entity->save();
            }
        }

        return $entity;
    }





    public function actionApiGetPermissions()
    {
        AuthPermissionSync::syncModels();

        $auth = \Yii::$app->authManager;
        $prefix = \Yii::$app->request->post('prefix');

        // Get permissions and roles
        $permissions = AuthPermissionSync::getPermissions($prefix);
        $roles = array_values(ArrayHelper::getColumn($auth->getRoles(), 'name'));
        usort($roles, function ($a, $b) {
            if ($a === 'admin' || $b === 'guest') {
                return 1;
            }
            if ($a === 'guest' || $b === 'admin') {
                return -1;
            }
            return 0;
        });

        // Initial values
        $initialValues = [
            'prefix' => $prefix,
        ];
        foreach ($roles as $role) {
            foreach ($auth->getPermissionsByRole($role) as $permission) {
                $initialValues['rules'][$role][$permission->name] = true;
                foreach ($this->getChildNamesRecursive($permission->name) as $child) {
                    $initialValues['rules'][$role][$child->name] = true;
                };
            }
        }

        return [
            'roles' => $roles,
            'permissions' => array_map(function (Permission $permission) use ($auth) {
                $children = array_values(ArrayHelper::getColumn($auth->getChildren($permission->name), 'name'));
                return [
                    'name' => $permission->name,
                    'description' => (string)$permission->description,
                    'children' => !empty($children) ? $children : null,
                ];
            }, array_values($permissions)),
            'initialValues' => $initialValues,
        ];
    }

    public function actionApiPermissionsSave()
    {
        $prefix = \Yii::$app->request->post('prefix');
        $data = \Yii::$app->request->post('rules');
        $allNames = ArrayHelper::getColumn(AuthPermissionSync::getPermissions($prefix), 'name');

        $auth = \Yii::$app->authManager;
        foreach ($auth->getRoles() as $role) {
            $rules = ArrayHelper::getValue($data, $role->name, []);
            $addedNames = [];
            $prevNames = ArrayHelper::getColumn($auth->getPermissionsByRole($role->name), 'name');
            $prevNames = array_filter($prevNames, function ($name) use ($allNames) {
                return in_array($name, $allNames);
            });

            foreach ($rules as $rule => $bool) {
                if (!$bool || strpos($rule, $prefix . '::') !== 0) {
                    continue;
                }

                // Find parent permission and check checked
                $isParentChecked = false;
                foreach ($allNames as $permissionName) {
                    $childNames = ArrayHelper::getColumn($auth->getChildren($permissionName), 'name');
                    if (in_array($rule, $childNames) && ArrayHelper::getValue($rules, $permissionName)) {
                        $isParentChecked = true;
                        break;
                    }
                }

                if (!$isParentChecked) {
                    $addedNames[] = $rule;
                    $permission = $auth->getPermission($rule);

                    AuthPermissionSync::safeAddChild($role, $permission);
                }
            }

            // Remove unchecked
            foreach (array_diff($prevNames, $addedNames) as $name) {
                $auth->removeChild($role, $auth->getPermission($name));
            }
        }

        \Yii::$app->session->addFlash('success', 'Permissions ' . $prefix . '::* updated');
    }

    protected function getChildNamesRecursive($permissionName)
    {
        $auth = \Yii::$app->authManager;
        $auth->getPermission($permissionName);
        $names = [];
        foreach ($auth->getChildren($permissionName) as $child) {
            $names[] = $child;
            $names = array_merge($names, $this->getChildNamesRecursive($child->name));
        }
        return $names;
    }

}
