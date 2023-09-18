import random


def main():
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">'

    fills = ["#f3b700", "#faa300", "#e57c04", "#ff6201", "#f63e02"]
    coords = [i for i in range(0, 1025, 256)]
    for i in range(50):
        fill = fills[i % len(fills)]
        x = random.choice(coords)
        y = random.choice(coords)
        step = random.choice([128, 256, 512])

        available_mod_fns = []
        if (x + step) <= 1024:
            if (y + step) <= 1024:
                available_mod_fns.extend(
                    [
                        [
                            lambda x, y, step: (x, y + step),
                            lambda x, y, step: (x + step, y),
                        ],
                        [
                            lambda x, y, step: (x + step, y),
                            lambda x, y, step: (x, y + step),
                        ],
                    ]
                )
            if (y - step) >= 0:
                available_mod_fns.extend(
                    [
                        [
                            lambda x, y, step: (x + step, y),
                            lambda x, y, step: (x, y - step),
                        ],
                        [
                            lambda x, y, step: (x, y - step),
                            lambda x, y, step: (x + step, y),
                        ],
                    ]
                )
        if (x - step) >= 0:
            if (y + step) <= 1024:
                available_mod_fns.extend(
                    [
                        [
                            lambda x, y, step: (x, y + step),
                            lambda x, y, step: (x - step, y),
                        ],
                        [
                            lambda x, y, step: (x - step, y),
                            lambda x, y, step: (x, y + step),
                        ],
                    ]
                )
            if (y - step) >= 0:
                available_mod_fns.extend(
                    [
                        [
                            lambda x, y, step: (x, y - step),
                            lambda x, y, step: (x - step, y),
                        ],
                        [
                            lambda x, y, step: (x - step, y),
                            lambda x, y, step: (x, y - step),
                        ],
                    ]
                )

        try:
            mod_fns = random.choice(available_mod_fns)
        except Exception:
            print(f"{x=} {y=}, {step=}")
            raise
        svg += f'<polygon fill="{fill}" points="'
        for mod_fn in [lambda x, y, step: (x, y)] + mod_fns:
            x, y = mod_fn(x, y, step)
            svg += f"{x} {y}, "

        svg = svg[:-2]
        svg += '" />'

    svg += "</svg>"
    print(svg)


if __name__ == "__main__":
    main()
