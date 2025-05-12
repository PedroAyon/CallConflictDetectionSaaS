from pydub import AudioSegment


def convert_m4a_to_wav(input_file, output_file=None):
    """
    Converts an M4A audio file to a WAV file.

    Args:
        input_file (str): Path to the input M4A file.
        output_file (str, optional): Path to save the output WAV file.
            If not provided, the output file will have the same name as the input file with a .wav extension.

    Returns:
        str: Path to the converted WAV file.

    Raises:
        FileNotFoundError: If the input file does not exist.
        Exception: For other issues during conversion.
    """
    if not output_file:
        # Change the file extension to .wav
        output_file = input_file.rsplit('.', 1)[0] + ".wav"

    try:
        # Load the M4A file
        audio = AudioSegment.from_file(input_file, format="m4a")

        # Export as WAV
        audio.export(output_file, format="wav")
        print(f"Successfully converted {input_file} to {output_file}")

        return output_file
    except FileNotFoundError:
        raise FileNotFoundError(f"Input file {input_file} does not exist.")
    except Exception as e:
        raise Exception(f"An error occurred during conversion: {e}")
