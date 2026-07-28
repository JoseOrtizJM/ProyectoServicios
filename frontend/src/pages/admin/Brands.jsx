import { createBrand, deleteBrand, listBrands, updateBrand } from "../../api/catalog";
import SimpleResourceManager from "../../components/admin/SimpleResourceManager";

export default function Brands() {
  return (
    <SimpleResourceManager
      title="Marcas"
      listFn={listBrands}
      createFn={createBrand}
      updateFn={updateBrand}
      deleteFn={deleteBrand}
    />
  );
}
