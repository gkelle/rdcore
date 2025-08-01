<?php
/**
 * Created by Gedit.
 * User: dirkvanderwalt
 * Date: 27/06/2025
 * Time: 21:35
 */

namespace App\Model\Table;
use Cake\ORM\Table;

class MacUsagesTable extends Table {

    public function initialize(array $config):void
    {
        $this->addBehavior('Timestamp');   
    }
}
