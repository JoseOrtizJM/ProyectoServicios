import { createCategory, deleteCategory, listCategories, updateCategory } from "../../api/catalog";
import SimpleResourceManager from "../../components/admin/SimpleResourceManager";

export default function Categories() {
  return (
    <SimpleResourceManager
      title="Categorías"
      listFn={listCategories}
      createFn={createCategory}
      updateFn={updateCategory}
      deleteFn={deleteCategory}
      productsFilterKey="category"
    />
  );
}
