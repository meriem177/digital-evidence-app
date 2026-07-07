import random


def predict(image):

    score = random.uniform(0.85, 0.99)

    manipulation = score < 0.93

    return {

        "confidence": score,

        "manipulation": manipulation

    }