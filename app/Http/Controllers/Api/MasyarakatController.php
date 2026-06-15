<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Masyarakat;
use Illuminate\Http\Request;

class MasyarakatController extends Controller
{
    public function store(Request $request)
    {
        $masyarakat = Masyarakat::create($request->all());
        return response()->json($masyarakat);
    }

    public function update(Request $request, $id)
    {
        $masyarakat = Masyarakat::findOrFail($id);
        $masyarakat->update($request->all());
        return response()->json($masyarakat);
    }

    public function destroy($id)
    {
        Masyarakat::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function destroyBulk(Request $request)
    {
        $ids = $request->input('ids', []);
        Masyarakat::whereIn('id', $ids)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
