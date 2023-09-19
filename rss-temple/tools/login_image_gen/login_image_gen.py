import random


def main():
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">'

    fills: dict[str | None, int] = {
        None: 1,
        "#F6953788": 3,
        "#EF7B0B88": 3,
        "#3798F688": 3,
        "#00567A88": 3,
    }
    for start_x in range(0, 1025, 64):
        for start_y in range(0, 1025, 64 * 2):
            fill = random.choices(list(fills.keys()), list(fills.values()))[0]

            if fill is not None:
                svg += f'<polygon fill="{fill}" points="{start_x} {start_y}, {start_x + 64} {start_y + 64}, {start_x} {start_y + 128}" />'

        for start_y in range(-64, 1025, 64 * 2):
            fill = random.choices(list(fills.keys()), list(fills.values()))[0]

            if fill is not None:
                svg += f'<polygon fill="{fill}" points="{start_x} {start_y}, {start_x - 64} {start_y + 64}, {start_x} {start_y + 128}" />'

    svg += "</svg>"
    print(svg)


if __name__ == "__main__":
    main()
