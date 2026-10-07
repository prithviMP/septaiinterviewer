ALLOWED_TOPICS = [
    "DSA",
    "LLD",
    "HLD",
    "Java",
    "Spring Boot",
    "Node.js",
    "Express",
]

QUESTION_BANK: dict[str, list[str]] = {
    "DSA": [
        "Given an array of integers, return the indices of two numbers that add up to a target. Explain your approach and its time and space complexity.",
        "Detect whether a linked list contains a cycle. Describe the algorithm you would use and why it is correct.",
    ],
    "LLD": [
        "Design a parking lot that supports multiple vehicle types and spot sizes. Describe the main classes and how a vehicle finds a spot.",
        "Design a rate limiter for an API. Which data structures would you use, and how would you handle multiple servers?",
    ],
    "HLD": [
        "Design a URL shortener that can handle high read traffic. Cover the API, storage, and how you generate short codes.",
        "Design a news feed for a social network. Explain how posts are stored, ranked, and delivered to followers.",
    ],
    "Java": [
        "Explain the difference between == and equals() in Java, and when you would override hashCode() as well.",
        "How does the Java memory model distinguish the stack and the heap, and what does the garbage collector reclaim?",
    ],
    "Spring Boot": [
        "What is dependency injection in Spring, and how would you choose between constructor and field injection?",
        "How does Spring Boot map an incoming HTTP request to a controller method? Mention filters and exception handling.",
    ],
    "Node.js": [
        "Explain the Node.js event loop. What happens when a route handler does heavy CPU work instead of async I/O?",
        "How would you structure error handling for async functions in Node.js, including rejected promises?",
    ],
    "Express": [
        "How does Express middleware work, and how would you write middleware that rejects a request with a missing auth token?",
        "How would you organize routes, controllers, and error-handling middleware in a medium-sized Express app?",
    ],
}


def questions_for_topics(topics: list[str]) -> list[dict]:
    rows: list[dict] = []
    position = 0
    for topic in topics:
        for text in QUESTION_BANK[topic]:
            rows.append({"position": position, "topic": topic, "question_text": text})
            position += 1
    return rows


def mock_score(response: str) -> float:
    length = len(response.strip())
    if length == 0:
        return 2.0
    return round(min(10.0, 3.0 + length / 25), 1)


def mock_feedback(topic: str, response: str, score: float) -> dict:
    if score >= 7:
        strengths = [
            f"The answer addresses the {topic} prompt directly.",
            "The response is long enough to show a structured explanation.",
        ]
        improvements = ["Add one concrete example or trade-off to make the answer more specific."]
    else:
        strengths = [f"The response attempts the {topic} question."]
        improvements = [
            "Expand the answer with the core approach, complexity or trade-offs, and a short example.",
            "Name the data structures or components you would use.",
        ]

    summary = (
        f"A strong {topic} answer states the approach, why it is correct, "
        "and the main trade-offs. The mock scorer used answer length only."
    )
    if not response.strip():
        improvements = ["Write an answer before submitting so the review has something to score."]

    return {
        "key_strengths": strengths,
        "areas_for_improvement": improvements,
        "ideal_answer_summary": summary,
    }
