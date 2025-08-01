<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class ProfileComponentsTable extends Table{


    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');
        $this->belongsTo('Users');
        $this->hasMany('Radgroupchecks', [
            'className'     => 'Radgroupchecks',
            'foreignKey'	=> 'groupname',
            'bindingKey'    => 'name',
            'sort'          => ['Radgroupchecks.groupname' => 'ASC'],
            'dependent'     => true
        ]);
        
        $this->hasMany('Radgroupreplies', [
            'className'     => 'Radgroupreplies',
            'foreignKey'	=> 'groupname',
            'bindingKey'    => 'name',
            'sort'          => ['Radgroupreplies.groupname' => 'ASC'],
            'dependent'     => true
        ]);
    }
    
    
     public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('name', 'A name is required')
            ->add('name', [ 
                'nameUnique' => [
                    'message' => 'The name you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }
    
}
