<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Mouse Inalámbrico', 'price' => 15.99, 'stock' => 100, 'sku' => 'SKU-0001'],
            ['name' => 'Teclado Mecánico RGB', 'price' => 45.50, 'stock' => 60, 'sku' => 'SKU-0002'],
            ['name' => 'Monitor 24" Full HD', 'price' => 129.99, 'stock' => 25, 'sku' => 'SKU-0003'],
            ['name' => 'Audífonos Bluetooth', 'price' => 29.90, 'stock' => 80, 'sku' => 'SKU-0004'],
            ['name' => 'Webcam Full HD', 'price' => 34.00, 'stock' => 40, 'sku' => 'SKU-0005'],
            ['name' => 'Laptop 15" Core i5', 'price' => 599.00, 'stock' => 10, 'sku' => 'SKU-0006'],
            ['name' => 'Disco SSD 1TB', 'price' => 79.99, 'stock' => 50, 'sku' => 'SKU-0007'],
            ['name' => 'Memoria RAM 16GB', 'price' => 55.00, 'stock' => 70, 'sku' => 'SKU-0008'],
            ['name' => 'Mousepad Gamer XL', 'price' => 12.50, 'stock' => 120, 'sku' => 'SKU-0009'],
            ['name' => 'Router WiFi 6', 'price' => 89.99, 'stock' => 35, 'sku' => 'SKU-0010'],
            ['name' => 'Silla Ergonómica', 'price' => 199.00, 'stock' => 15, 'sku' => 'SKU-0011'],
            ['name' => 'Micrófono USB', 'price' => 49.99, 'stock' => 45, 'sku' => 'SKU-0012'],
            ['name' => 'Cargador USB-C 65W', 'price' => 22.00, 'stock' => 90, 'sku' => 'SKU-0013'],
            ['name' => 'Hub USB 7 puertos', 'price' => 18.75, 'stock' => 60, 'sku' => 'SKU-0014'],
            ['name' => 'Impresora Multifuncional', 'price' => 149.00, 'stock' => 12, 'sku' => 'SKU-0015'],
        ];

        foreach ($products as $data) {
            Product::create([
                'name' => $data['name'],
                'description' => "Producto de ejemplo: {$data['name']}. Ideal para uso en oficina o entretenimiento.",
                'price' => $data['price'],
                'stock' => $data['stock'],
                'sku' => $data['sku'],
                'image' => null,
                'is_active' => true,
            ]);
        }
    }
}
