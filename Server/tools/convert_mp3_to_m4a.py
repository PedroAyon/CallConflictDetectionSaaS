from pydub import AudioSegment
import os


def convert_mp3_to_m4a(input_folder, output_folder):
    """
    Converts all MP3 files in a given input folder to M4A format
    and saves them to an output folder.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(".mp3"):
            mp3_filepath = os.path.join(input_folder, filename)

            # Create the output filename with .m4a extension
            base_name = os.path.splitext(filename)[0]
            m4a_filepath = os.path.join(output_folder, f"{base_name}.m4a")

            try:
                audio = AudioSegment.from_mp3(mp3_filepath)
                audio.export(m4a_filepath, format="m4a")
                print(f"Converted '{filename}' to '{os.path.basename(m4a_filepath)}'")
            except Exception as e:
                print(f"Error converting '{filename}': {e}")


# Example usage:
input_directory = "/home/pedro-ayon/Downloads/audios"  # Replace with your input folder path
output_directory = "/home/pedro-ayon/Downloads/audios"  # Replace with your desired output folder path

convert_mp3_to_m4a(input_directory, output_directory)