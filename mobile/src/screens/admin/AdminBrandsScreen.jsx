import { createBrand, deleteBrand, listBrands, updateBrand } from "../../api/catalog";
import SimpleResourceManager from "../../components/admin/SimpleResourceManager";

export default function AdminBrandsScreen() {
  return (
    <SimpleResourceManager
      title="Marca"
      listFn={listBrands}
      createFn={createBrand}
      updateFn={updateBrand}
      deleteFn={deleteBrand}
    />
  );
}
