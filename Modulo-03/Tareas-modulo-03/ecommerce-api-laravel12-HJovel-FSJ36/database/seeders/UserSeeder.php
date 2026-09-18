<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@example.com',
            'password' => Hash::make('Admin1234'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Cliente de Prueba',
            'email' => 'cliente@example.com',
            'password' => Hash::make('Cliente1234'),
            'role' => 'customer',
        ]);
    }
}
