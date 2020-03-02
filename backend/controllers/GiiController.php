<?php

namespace steroids\gii\controllers;

use Yii;
use steroids\core\base\FormModel;
use steroids\gii\forms\EntityInterface;
use steroids\core\helpers\ClassFile;
use steroids\core\helpers\ModuleHelper;
use steroids\core\base\Type;
use steroids\gii\GiiModule;
use steroids\gii\enums\ClassType;
use steroids\gii\forms\BackendBackendEnumEntity;
use steroids\gii\forms\BackendFormEntity;
use steroids\gii\forms\BackendModelEntity;
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
                    'entity' => 'GET,POST /api/gii/entities/<type>',
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
                'className' => BackendBackendEnumEntity::class,
                'label' => 'enums',
                'type' => ClassType::ENUM,
                'dir' => ClassType::getDir(ClassType::ENUM),
            ],
            [
                'className' => BackendFormEntity::class,
                'label' => 'forms',
                'type' => ClassType::FORM,
                'dir' => ClassType::getDir(ClassType::FORM),
            ],
            [
                'className' => BackendModelEntity::class,
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
                'id' => 'app-' . $applicationLabel,
                'type' => 'application',
                'label' => $applicationLabel,
                'itemsType' => $applicationLabel === 'backend' ? ClassType::MODULE : null,
                'items' => array_map(
                    function (ClassFile $module) use ($entityTypes) {
                        $items = [];

                        foreach ($entityTypes as $entityType) {
                            $entities = [];

                            $entityNamespace = $module->namespace . '\\' . str_replace('/', '\\', $entityType['dir']);
                            $classFiles = ModuleHelper::findModuleClasses($module, $entityType['type'], $entityType['dir']);
                            foreach ($classFiles as $classFile) {
                                $entity = $entityType['className']::findOne($classFile);
                                if ($entity) {
                                    $entities[] = $entity;
                                }
                            }

                            $typeItems = array_map(
                                function (EntityInterface $entity) use ($entityType) {
                                    return [
                                        'id' =>str_replace('\\', '-',  $entity->classFile->className),
                                        'type' => $entityType['type'],
                                        'label' => $entity->classFile->name,
                                        'namespace' => $entity->classFile->namespace,
                                        'className' => $entity->classFile->className,
                                        'name' => $entity->classFile->name,
                                    ];
                                },
                                $entities
                            );
                            ArrayHelper::multisort($typeItems, 'label');

                            $items[] = [
                                'id' => 'module-' . $module->moduleId . '-' . $entityType['label'],
                                'type' => 'directory',
                                'itemsType' => $entityType['type'],
                                'itemsParams' => [
                                    'namespace' => $entityNamespace,
                                ],
                                'label' => $entityType['label'],
                                'items' => $typeItems,
                            ];
                        }

                        ArrayHelper::multisort($items, 'label');
                        return [
                            'id' => 'module-' . $module->moduleId,
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

    public function actionEntity($type)
    {
        /** @var EntityInterface|FormModel $entityClass */
        $entityClass = ClassType::getEntityClass($type);
        $data = Yii::$app->request->isPost ? Yii::$app->request->post() : Yii::$app->request->get();

        $classFile = null;
        switch ($type) {
            case ClassType::MODEL:
            case ClassType::FORM:
            case ClassType::CRUD:
            case ClassType::ENUM:
                $id = ArrayHelper::getValue($data, 'id', '');
                $namespace = ArrayHelper::getValue($data, 'namespace', '');
                $name = ArrayHelper::getValue($data, 'name', '');
                $className = $namespace && $name ? $namespace . '\\' . ucfirst($name) : $id;
                if ($className) {
                    $className = str_replace('-', '\\', $className);
                    $classFile = ClassFile::createByClass($className, $type);
                    $classFile->type = $type;
                }
                break;

            case ClassType::MODULE:
                break;

            default:
                throw new BadRequestHttpException('Wrong type: ' . $type);
        }

        $entity = null;
        if (Yii::$app->request->isPost) {
            $entity = $entityClass::findOrCreate($classFile);
            $entity->attributes = $data;
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
        } elseif ($classFile) {
            $entity = $entityClass::findOne($classFile);
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
