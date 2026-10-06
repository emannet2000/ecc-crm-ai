module View.Charts exposing
    ( BarDatum
    , HeatCell
    , barChart
    , gauge
    , heatmap
    , lineChart
    )

{-| Charting primitives rendered as inline SVG. Uses Elm SVG to create elements in the correct namespace. All charts are decorative in the
sense that they carry role="img" and no interactive states.
-}

import Html exposing (..)
import Html.Attributes as Attr exposing (class)
import Svg


type alias BarDatum =
    { label : String
    , value : Float
    , color : String
    }


type alias HeatCell =
    { row : Int
    , col : Int
    , value : Float
    }


barChart : List BarDatum -> Html msg
barChart data =
    let
        maxV =
            List.maximum (List.map .value data) |> Maybe.withDefault 1

        n =
            List.length data

        chartLeft =
            10

        chartRight =
            390

        chartTop =
            24

        chartBottom =
            168

        chartW =
            chartRight - chartLeft

        chartH =
            chartBottom - chartTop

        slotW =
            chartW / toFloat (max 1 n)

        barW =
            slotW * 0.62

        gap =
            slotW - barW

        yFor v =
            chartBottom - (v / maxV) * chartH

        barAt i d =
            let
                x =
                    chartLeft + toFloat i * slotW + gap / 2

                y =
                    yFor d.value

                h =
                    chartBottom - y

                cx =
                    x + barW / 2
            in
            Svg.node "g"
                []
                [ Svg.node "rect"
                    [ Attr.attribute "x" (String.fromFloat x)
                    , Attr.attribute "y" (String.fromFloat y)
                    , Attr.attribute "width" (String.fromFloat barW)
                    , Attr.attribute "height" (String.fromFloat (max 0 h))
                    , Attr.attribute "rx" "4"
                    , Attr.attribute "fill" d.color
                    , Attr.attribute "opacity" "0.92"
                    ]
                    []
                , Svg.node "text"
                    [ Attr.attribute "x" (String.fromFloat cx)
                    , Attr.attribute "y" "18"
                    , Attr.attribute "text-anchor" "middle"
                    , Attr.attribute "fill" "var(--gold-bright)"
                    , Attr.attribute "font-size" "11"
                    , Attr.attribute "font-weight" "600"
                    , Attr.attribute "font-family" "inherit"
                    ]
                    [ text (String.fromInt (round d.value)) ]
                , Svg.node "text"
                    [ Attr.attribute "x" (String.fromFloat cx)
                    , Attr.attribute "y" "188"
                    , Attr.attribute "text-anchor" "middle"
                    , Attr.attribute "fill" "var(--text-muted)"
                    , Attr.attribute "font-size" "11"
                    , Attr.attribute "font-family" "inherit"
                    ]
                    [ text d.label ]
                ]

        baseline =
            Svg.node "line"
                [ Attr.attribute "x1" (String.fromFloat chartLeft)
                , Attr.attribute "y1" (String.fromFloat chartBottom)
                , Attr.attribute "x2" (String.fromFloat chartRight)
                , Attr.attribute "y2" (String.fromFloat chartBottom)
                , Attr.attribute "stroke" "var(--border)"
                , Attr.attribute "stroke-width" "1"
                ]
                []
    in
    Svg.node "svg"
        [ Attr.attribute "viewBox" "0 0 400 200"
        , Attr.attribute "class" "chart-bar"
        , Attr.attribute "role" "img"
        , Attr.attribute "aria-label" "Deal value by stage"
        ]
        (baseline :: List.indexedMap barAt data)


lineChart : List Float -> Html msg
lineChart values =
    let
        n =
            List.length values

        maxV =
            List.maximum values |> Maybe.withDefault 1

        chartLeft =
            8

        chartRight =
            392

        chartTop =
            8

        chartBottom =
            92

        chartW =
            chartRight - chartLeft

        chartH =
            chartBottom - chartTop

        xFor i =
            if n <= 1 then
                chartLeft

            else
                chartLeft + (toFloat i / toFloat (n - 1)) * chartW

        yFor v =
            chartBottom - (v / maxV) * chartH

        points =
            List.indexedMap (\i v -> ( xFor i, yFor v )) values

        pointStr ( x, y ) =
            String.fromFloat x ++ "," ++ String.fromFloat y

        polyline =
            String.join " " (List.map pointStr points)

        areaPath =
            case points of
                [] ->
                    ""

                first :: _ ->
                    let
                        ( x0, _ ) =
                            first

                        lastPt =
                            List.reverse points
                                |> List.head
                                |> Maybe.withDefault first

                        ( xN, _ ) =
                            lastPt
                    in
                    "M "
                        ++ String.fromFloat x0
                        ++ " "
                        ++ String.fromFloat chartBottom
                        ++ " L "
                        ++ String.join " L " (List.map pointStr points)
                        ++ " L "
                        ++ String.fromFloat xN
                        ++ " "
                        ++ String.fromFloat chartBottom
                        ++ " Z"
    in
    Svg.node "svg"
        [ Attr.attribute "viewBox" "0 0 400 100"
        , Attr.attribute "class" "chart-line"
        , Attr.attribute "preserveAspectRatio" "none"
        , Attr.attribute "role" "img"
        ]
        [ Svg.node "defs"
            []
            [ Svg.node "linearGradient"
                [ Attr.attribute "id" "ecc-line-area"
                , Attr.attribute "x1" "0"
                , Attr.attribute "y1" "0"
                , Attr.attribute "x2" "0"
                , Attr.attribute "y2" "1"
                ]
                [ Svg.node "stop"
                    [ Attr.attribute "offset" "0"
                    , Attr.attribute "stop-color" "rgba(240,207,116,0.45)"
                    ]
                    []
                , Svg.node "stop"
                    [ Attr.attribute "offset" "1"
                    , Attr.attribute "stop-color" "rgba(240,207,116,0)"
                    ]
                    []
                ]
            ]
        , Svg.node "path"
            [ Attr.attribute "d" areaPath
            , Attr.attribute "fill" "url(#ecc-line-area)"
            ]
            []
        , Svg.node "polyline"
            [ Attr.attribute "points" polyline
            , Attr.attribute "fill" "none"
            , Attr.attribute "stroke" "var(--gold)"
            , Attr.attribute "stroke-width" "2"
            , Attr.attribute "stroke-linecap" "round"
            , Attr.attribute "stroke-linejoin" "round"
            ]
            []
        ]


gauge : String -> Float -> Float -> Html msg
gauge label current maxV =
    let
        pct =
            if maxV <= 0 then
                0

            else
                clamp 0 1 (current / maxV)

        cx =
            100

        cy =
            100

        r =
            76

        endAngle =
            180 + pct * 180

        toRad a =
            a * pi / 180

        x1 =
            cx + r * cos (toRad 180)

        y1 =
            cy + r * sin (toRad 180)

        x2 =
            cx + r * cos (toRad endAngle)

        y2 =
            cy + r * sin (toRad endAngle)

        largeArc =
            if endAngle - 180 > 180 then
                "1"

            else
                "0"

        arcPath =
            "M "
                ++ String.fromFloat x1
                ++ " "
                ++ String.fromFloat y1
                ++ " A "
                ++ String.fromFloat r
                ++ " "
                ++ String.fromFloat r
                ++ " 0 "
                ++ largeArc
                ++ " 1 "
                ++ String.fromFloat x2
                ++ " "
                ++ String.fromFloat y2

        trackPath =
            "M "
                ++ String.fromFloat x1
                ++ " "
                ++ String.fromFloat y1
                ++ " A "
                ++ String.fromFloat r
                ++ " "
                ++ String.fromFloat r
                ++ " 0 0 1 "
                ++ String.fromFloat (cx + r)
                ++ " "
                ++ String.fromFloat cy
    in
    Svg.node "svg"
        [ Attr.attribute "viewBox" "0 0 200 130"
        , Attr.attribute "class" "chart-gauge"
        , Attr.attribute "role" "img"
        , Attr.attribute "aria-label" (label ++ ": " ++ String.fromInt (round (pct * 100)) ++ "%")
        ]
        [ Svg.node "path"
            [ Attr.attribute "d" trackPath
            , Attr.attribute "fill" "none"
            , Attr.attribute "stroke" "var(--surface-3)"
            , Attr.attribute "stroke-width" "14"
            , Attr.attribute "stroke-linecap" "round"
            ]
            []
        , Svg.node "path"
            [ Attr.attribute "d" arcPath
            , Attr.attribute "fill" "none"
            , Attr.attribute "stroke" "var(--gold)"
            , Attr.attribute "stroke-width" "14"
            , Attr.attribute "stroke-linecap" "round"
            ]
            []
        , Svg.node "text"
            [ Attr.attribute "x" "100"
            , Attr.attribute "y" "86"
            , Attr.attribute "text-anchor" "middle"
            , Attr.attribute "fill" "var(--gold-bright)"
            , Attr.attribute "font-size" "30"
            , Attr.attribute "font-weight" "600"
            , Attr.attribute "font-family" "inherit"
            ]
            [ text (String.fromInt (round (pct * 100)) ++ "%") ]
        , Svg.node "text"
            [ Attr.attribute "x" "100"
            , Attr.attribute "y" "112"
            , Attr.attribute "text-anchor" "middle"
            , Attr.attribute "fill" "var(--text-muted)"
            , Attr.attribute "font-size" "10"
            , Attr.attribute "letter-spacing" "0.14em"
            , Attr.attribute "font-family" "inherit"
            , Attr.attribute "font-weight" "700"
            ]
            [ text (String.toUpper label) ]
        ]


heatmap : Int -> List HeatCell -> Html msg
heatmap cols cells =
    let
        maxV =
            List.maximum (List.map .value cells) |> Maybe.withDefault 1

        cellSize =
            12

        gap =
            2

        rowsCount =
            case List.maximum (List.map .row cells) of
                Just m ->
                    m + 1

                Nothing ->
                    0

        width =
            toFloat cols * (cellSize + gap)

        height =
            toFloat rowsCount * (cellSize + gap)

        colorFor v =
            let
                intensity =
                    if maxV <= 0 then
                        0

                    else
                        v / maxV
            in
            "rgba(226,185,77,"
                ++ String.fromFloat (0.12 + intensity * 0.78)
                ++ ")"

        cellView c =
            Svg.node "rect"
                [ Attr.attribute "x"
                    (String.fromFloat (toFloat c.col * (cellSize + gap)))
                , Attr.attribute "y"
                    (String.fromFloat (toFloat c.row * (cellSize + gap)))
                , Attr.attribute "width" (String.fromFloat cellSize)
                , Attr.attribute "height" (String.fromFloat cellSize)
                , Attr.attribute "rx" "3"
                , Attr.attribute "fill" (colorFor c.value)
                ]
                []
    in
    Svg.node "svg"
        [ Attr.attribute "viewBox"
            ("0 0 "
                ++ String.fromFloat width
                ++ " "
                ++ String.fromFloat height
            )
        , Attr.attribute "class" "chart-heat"
        , Attr.attribute "role" "img"
        ]
        (List.map cellView cells)
