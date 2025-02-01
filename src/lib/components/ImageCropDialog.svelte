<script lang="ts">
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Cropper, { type OnCropComplete } from 'svelte-easy-crop';

  let {
    open = $bindable(),
    onimagecropped = $bindable(),
    crop = $bindable({ x: 0, y: 0 }),
    zoom = $bindable(1),
    aspect = 1,
    cropShape = 'rect',
    image = $bindable(),
    imageType,
  }: {
    open: boolean;
    onimagecropped: (croppedImageDataUrl: string, mimeType: string) => void;
    crop?: { x: number; y: number };
    zoom?: number;
    aspect?: number;
    cropShape?: 'rect' | 'round';
    image: string;
    imageType: string;
  } = $props();

  let cropPixelData = $state<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  let canvas = $state<HTMLCanvasElement | null>(null);
  let croppedData = $state<string>('');

  $effect(() => {
    if (croppedData) onimagecropped(croppedData, imageType);
  });

  export const cropImage = () => {
    if (canvas == null || !image) throw new Error('no canvas or image!');
    const img = new Image();

    img.onload = () => {
      const ctx = canvas!.getContext('2d');

      canvas!.width = cropPixelData.width;
      canvas!.height = cropPixelData.height;

      ctx?.drawImage(
        img,
        cropPixelData.x,
        cropPixelData.y,
        cropPixelData.width,
        cropPixelData.height,
        0,
        0,
        cropPixelData.width,
        cropPixelData.height,
      );

      croppedData = canvas!.toDataURL(imageType);
    };

    img.src = image;
  };
</script>

<div class={'margin' + (open ? '' : ' hidden')}>
  <canvas
    bind:this={canvas}
    class="hidden"
  ></canvas>
  <Dialog
    bind:open
    aria-labelledby="simple-title"
    aria-describedby="simple-content"
    surface$class="size-auto"
  >
    <Title id="simple-title">Dialog Title</Title>
    <Content id="simple-content">
      <div class="relative aspect-[1/1] portrait:w-[80vw] landscape:h-[50vh]">
        <Cropper
          {crop}
          {zoom}
          {image}
          {aspect}
          {cropShape}
          oncropcomplete={(e) => (cropPixelData = e.pixels)}
        />
      </div>
    </Content>
    <Actions>
      <Button onclick={() => cropImage()}>
        <Label>Zuschneiden</Label>
      </Button>
    </Actions>
  </Dialog>
</div>
