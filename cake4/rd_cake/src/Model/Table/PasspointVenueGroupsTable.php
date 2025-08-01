<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class PasspointVenueGroupsTable extends Table {

    public function initialize(array $config):void{  
        $this->addBehavior('Timestamp');  
    }
      
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('name', 'A name is required')
            ->add('name', [ 
                'nameUnique' => [
                    'message'   => 'The name you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique'],
                    'provider'  => 'table'
                ]
            ]);           
        return $validator;
    }      
}

