import pytest
from pathlib import Path
from tools.audio_utils import convert_m4a_to_wav


def test_convert_m4a_to_wav_success(tmp_path):
    # Copia el archivo de prueba al tmp_path
    test_dir = Path(__file__).parent
    source_m4a = test_dir / "test_audio.m4a"
    input_path = tmp_path / "test_audio.m4a"
    output_path = tmp_path / "test_audio.wav"
    input_path.write_bytes(source_m4a.read_bytes())  # Copiar contenido

    result = convert_m4a_to_wav(str(input_path), str(output_path))

    assert Path(result).exists()
    assert result.endswith(".wav")


def test_convert_m4a_to_wav_default_output_path(tmp_path):
    # Copia el archivo de prueba al tmp_path
    test_dir = Path(__file__).parent
    source_m4a = test_dir / "test_audio.m4a"
    input_path = tmp_path / "sample.m4a"
    input_path.write_bytes(source_m4a.read_bytes())

    result = convert_m4a_to_wav(str(input_path))

    expected_output = str(input_path).rsplit('.', 1)[0] + ".wav"
    assert result == expected_output
    assert Path(result).exists()


def test_convert_m4a_to_wav_file_not_found():
    with pytest.raises(FileNotFoundError):
        convert_m4a_to_wav("nonexistent.m4a")


def test_convert_m4a_to_wav_raises_other_exception(tmp_path):
    input_path = tmp_path / "corrupt.m4a"
    input_path.write_text("bad data")

    from unittest import mock
    with mock.patch("tools.audio_utils.AudioSegment.from_file", side_effect=ValueError("Corrupted")):
        with pytest.raises(Exception, match="An error occurred during conversion: Corrupted"):
            convert_m4a_to_wav(str(input_path))
