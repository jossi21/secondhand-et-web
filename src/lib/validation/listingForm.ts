export interface ListingFormErrors {
  title?: string;
  description?: string;
  price?: string;
  city?: string;
  categoryId?: string;
}

export interface ListingFormValues {
  title: string;
  description: string;
  price: string;
  city: string;
  categoryId: string;
}

export function validateListingForm(
  values: ListingFormValues,
): ListingFormErrors {
  const errors: ListingFormErrors = {};

  if (!values.title.trim()) errors.title = "Title is required.";
  else if (values.title.trim().length < 3) errors.title = "Title is too short.";

  if (!values.description.trim())
    errors.description = "Description is required.";
  else if (values.description.trim().length < 10)
    errors.description = "Please add a bit more detail.";

  const priceNum = Number(values.price);
  if (!values.price.trim()) errors.price = "Price is required.";
  else if (Number.isNaN(priceNum) || priceNum <= 0)
    errors.price = "Enter a valid price.";

  if (!values.city.trim()) errors.city = "City is required.";

  if (!values.categoryId) errors.categoryId = "Select a category.";

  return errors;
}
