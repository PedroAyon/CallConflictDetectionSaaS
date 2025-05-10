import pytest
from conflict_detection import ConflictDetector

@pytest.fixture(scope="module")
def detector():
    # Instantiate once per module to avoid reloading the model for every test
    return ConflictDetector()

@pytest.mark.parametrize("conversation", [
    "Agent: Hello\nCustomer: I'm really unhappy with this service!",
    "Agent: Let me help\nCustomer: This is not great.",
    "Agent: Good morning\nCustomer: This is fantastic, thank you!",
    "Agent: Thanks for calling\nCustomer: Your billing is a nightmare!",
])
def test_detect_conflict_returns_bool(detector, conversation):
    result = detector.detect_conflict(conversation)
    assert isinstance(result, bool), f"Expected bool, got {type(result)}"


def test_detect_conflict_empty_and_whitespace(detector):
    for txt in ["", "   ", "\n\n"]:
        result = detector.detect_conflict(txt)
        assert isinstance(result, bool)
        assert result is False  # Safe to expect False here

