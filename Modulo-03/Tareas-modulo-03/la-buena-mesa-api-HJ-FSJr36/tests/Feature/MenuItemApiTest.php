<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuItemApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_puede_listar_elementos_del_menu(): void
    {
        MenuItem::factory()->count(3)->create();

        $response = $this->getJson('/api/menu-items');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'price', 'category', 'is_available'],
                ],
                'links',
                'meta',
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_puede_crear_un_elemento_del_menu(): void
    {
        $payload = [
            'name' => 'Ceviche Mixto',
            'description' => 'Pescado y mariscos frescos en leche de tigre.',
            'price' => 16.90,
            'category' => 'Entradas',
            'is_available' => true,
        ];

        $response = $this->postJson('/api/menu-items', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Ceviche Mixto')
            ->assertJsonPath('data.price', 16.9);

        $this->assertDatabaseHas('menu_items', ['name' => 'Ceviche Mixto']);
    }

    public function test_rechaza_creacion_con_datos_invalidos(): void
    {
        $response = $this->postJson('/api/menu-items', [
            'name' => '',
            'price' => -5,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'price', 'category']);
    }

    public function test_puede_mostrar_un_elemento_especifico(): void
    {
        $menuItem = MenuItem::factory()->create();

        $response = $this->getJson("/api/menu-items/{$menuItem->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $menuItem->id);
    }

    public function test_devuelve_404_para_un_elemento_inexistente(): void
    {
        $response = $this->getJson('/api/menu-items/999999');

        $response->assertNotFound();
    }

    public function test_puede_actualizar_un_elemento(): void
    {
        $menuItem = MenuItem::factory()->create(['price' => 10]);

        $response = $this->putJson("/api/menu-items/{$menuItem->id}", [
            'price' => 12.50,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.price', 12.5);

        $this->assertDatabaseHas('menu_items', [
            'id' => $menuItem->id,
            'price' => 12.50,
        ]);
    }

    public function test_puede_eliminar_un_elemento(): void
    {
        $menuItem = MenuItem::factory()->create();

        $response = $this->deleteJson("/api/menu-items/{$menuItem->id}");

        $response->assertOk();
        $this->assertSoftDeleted('menu_items', ['id' => $menuItem->id]);
    }

    public function test_puede_filtrar_por_categoria_via_ruta(): void
    {
        MenuItem::factory()->count(2)->category('Postres')->create();
        MenuItem::factory()->count(3)->category('Bebidas')->create();

        $response = $this->getJson('/api/menu-items/category/Postres');

        $response->assertOk()->assertJsonCount(2, 'data');
    }
}
