import os
from PIL import Image


def split_image(image_path, chunks, direction, output_dir, overlap_ratio=0.2):
    img = Image.open(image_path)
    width, height = img.size

    os.makedirs(output_dir, exist_ok=True)

    if not (0 <= overlap_ratio < 1):
        raise ValueError("overlap_ratio must be between 0 and 1")

    if direction == "vertical":
        step = int(width / chunks)
        overlap = int(step * overlap_ratio)

        for i in range(chunks):
            left = max(0, i * step - overlap)
            right = min(width, (i + 1) * step + overlap)

            crop = img.crop((left, 0, right, height))
            crop.save(os.path.join(output_dir, f"chunk_{i}.png"))

    elif direction == "horizontal":
        step = int(height / chunks)
        overlap = int(step * overlap_ratio)

        for i in range(chunks):
            top = max(0, i * step - overlap)
            bottom = min(height, (i + 1) * step + overlap)

            crop = img.crop((0, top, width, bottom))
            crop.save(os.path.join(output_dir, f"chunk_{i}.png"))

    else:
        raise ValueError("Direction must be 'vertical' or 'horizontal'")

    print(f"\nSaved {chunks} overlapping chunks to '{output_dir}'")
    print(f"Overlap ratio used: {overlap_ratio * 100:.1f}%")



def main():
    print("=== Image Splitter CLI (with Overlap) ===\n")

    # Step 1: Image path
    image_path = input("Enter image path: ").strip()
    if not os.path.exists(image_path):
        print("Invalid path.")
        return

    # Step 2: Number of chunks
    try:
        chunks = int(input("Enter number of chunks: "))
        if chunks <= 0:
            raise ValueError
    except ValueError:
        print("Chunks must be a positive integer.")
        return

    # Step 3: Direction
    direction = input("Split direction (vertical/horizontal): ").strip().lower()
    if direction not in ["vertical", "horizontal"]:
        print("Invalid direction.")
        return

    # Step 4: Overlap
    try:
        overlap_ratio = float(input("Enter overlap ratio (e.g., 0.2 for 20%): "))
        if not (0 <= overlap_ratio < 1):
            raise ValueError
    except ValueError:
        print("Invalid overlap ratio.")
        return

    # Step 5: Output directory
    output_dir = input("Output directory (default: output_chunks): ").strip()
    if output_dir == "":
        output_dir = "output_chunks"

    # Run
    split_image(image_path, chunks, direction, output_dir, overlap_ratio)


if __name__ == "__main__":
    main()