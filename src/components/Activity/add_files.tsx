import { Component, createSignal, Show, For } from "solid-js";

interface ActivityFilesProps {
  activityId: string;
  onGpxChange: (gpxUrl: string) => void;
  onImageChange?: (imageUrl: string[]) => void;
}

export const ActivityFiles: Component<ActivityFilesProps> = (props) => {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [gpxUrl, setGpxUrl] = createSignal<string | null>(null);
  const [selectedImages, setSelectedImages] = createSignal<string[]>([]);
  const [uploadProgress, setUploadProgress] = createSignal(0);

  // Handle image file selection
  const handleImageSelection = (e: Event) => {
    const input = e.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const newImages: string[] = [];
    const fileArray = Array.from(input.files);

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageUrl = e.target.result as string;
          newImages.push(imageUrl);
          // If this was the last file, update state
          if (newImages.length === fileArray.length) {
            setSelectedImages((prev) => [...prev, ...newImages]);
            if (props.onImageChange) {
              props.onImageChange([...selectedImages(), ...newImages]);
            }
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle image removal
  const removeImage = (index: number) => {
    const updatedImages = selectedImages().filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    if (props.onImageChange) {
      props.onImageChange(updatedImages);
    }
  };

  return (
    <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div class="bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-4">
        <h2 class="text-xl font-semibold text-white">Activity Files</h2>
        <p class="text-sky-100 text-sm">Add GPS data and photos from your activity</p>
      </div>

      <div class="p-6 space-y-8">
        {/* GPX File Section */}
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-800">GPS Track Data</h3>
            <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">GPX format</div>
          </div>

          <div class="relative">
            <input
              type="file"
              id="gpx-file"
              accept=".gpx"
              class="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              disabled={!props.activityId || loading()}
              onChange={() => {
                // Simulate upload progress
                setLoading(true);
                setError(null);
                setUploadProgress(0);
                const interval = setInterval(() => {
                  setUploadProgress((prev) => {
                    const newProgress = prev + 10;
                    if (newProgress >= 100) {
                      clearInterval(interval);
                      setTimeout(() => {
                        setLoading(false);
                        setGpxUrl("https://example.com/fake-gpx-url.gpx"); // Simulate success
                        props.onGpxChange("https://example.com/fake-gpx-url.gpx");
                      }, 300);
                      return 100;
                    }
                    return newProgress;
                  });
                }, 200);
              }}
            />
            <div
              class={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                !props.activityId
                  ? "bg-gray-50 border-gray-300 cursor-not-allowed"
                  : "border-sky-300 hover:border-sky-500 hover:bg-sky-50"
              }`}
            >
              <div class="flex flex-col items-center justify-center space-y-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class={`h-12 w-12 ${
                    !props.activityId ? "text-gray-400" : "text-sky-500"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div class="text-sm text-gray-600">
                  <span class="font-medium text-sky-600">Click to upload</span>{" "}
                  or drag and drop
                </div>
                <p class="text-xs text-gray-500">GPX files only (Max 10MB)</p>
              </div>
            </div>
          </div>

          <Show when={loading()}>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-sky-600 h-2.5 rounded-full transition-all duration-300"
                style={`width: ${uploadProgress()}%`}
              ></div>
            </div>
            <p class="text-sm text-gray-600 text-center">
              Uploading... {uploadProgress()}%
            </p>
          </Show>

          <Show when={error()}>
            <div class="bg-red-50 border-l-4 border-red-500 p-4">
              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-red-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z"
                    clip-rule="evenodd"
                  />
                </svg>
                <p class="text-sm text-red-700">{error()}</p>
              </div>
            </div>
          </Show>

          <Show when={gpxUrl() && !loading()}>
            <div class="bg-green-50 border-l-4 border-green-500 p-4">
              <div class="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-green-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <p class="text-sm text-green-700">
                  GPS track uploaded successfully!
                </p>
              </div>
            </div>
          </Show>
        </div>

        {/* Image Upload Section */}
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-800">Activity Photos</h3>
            <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              JPG, PNG
            </div>
          </div>

          <div class="relative">
            <input
              type="file"
              id="image-files"
              accept="image/*"
              multiple
              class="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              onChange={handleImageSelection}
            />
            <div class="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-lg p-6 text-center transition-all hover:bg-sky-50">
              <div class="flex flex-col items-center justify-center space-y-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-12 w-12 text-sky-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div class="text-sm text-gray-600">
                  <span class="font-medium text-sky-600">Click to upload</span>{" "}
                  or drag and drop
                </div>
                <p class="text-xs text-gray-500">
                  Up to 10 images (Max 5MB each)
                </p>
              </div>
            </div>
          </div>

          <Show when={selectedImages().length > 0}>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <For each={selectedImages()}>
                {(image, index) => (
                  <div class="relative group">
                    <img
                      src={image}
                      alt={`Activity photo ${index() + 1}`}
                      class="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index())}
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

