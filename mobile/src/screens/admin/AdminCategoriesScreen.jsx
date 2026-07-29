import { createCategory, deleteCategory, listCategories, updateCategory } from "../../api/catalog";
import SimpleResourceManager from "../../components/admin/SimpleResourceManager";

export default function AdminCategoriesScreen() {
  return (
    <SimpleResourceManager
      title="Categoría"
      listFn={listCategories}
      createFn={createCategory}
      updateFn={updateCategory}
      deleteFn={deleteCategory}
      productsFilterType="category"
    />
  );
}
