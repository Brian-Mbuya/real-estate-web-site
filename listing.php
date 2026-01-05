<?php
$conn = new mysqli("localhost", "root", "", "real_estate");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// User preferences (simple demo inputs)
$budget = isset($_GET['budget']) ? (int)$_GET['budget'] : 500000;
$preferredLocation = isset($_GET['location']) ? $conn->real_escape_string($_GET['location']) : '';
$preferredType = isset($_GET['type']) ? $conn->real_escape_string($_GET['type']) : '';

$sql = "
SELECT *,
(
    CASE
        WHEN price BETWEEN ($budget - 50000) AND ($budget + 50000) THEN 3
        WHEN price BETWEEN ($budget - 100000) AND ($budget + 100000) THEN 2
        ELSE 1
    END
    +
    CASE
        WHEN location = '$preferredLocation' AND '$preferredLocation' != '' THEN 3
        ELSE 0
    END
    +
    CASE
        WHEN type = '$preferredType' AND '$preferredType' != '' THEN 2
        ELSE 0
    END
    +
    CASE
        WHEN bedrooms >= 3 THEN 1
        ELSE 0
    END
) AS smart_score
FROM properties
ORDER BY smart_score DESC, price ASC
";

$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Property Listings</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; }
        .container { width: 80%; margin: auto; }
        .filters, .property { background: #fff; padding: 15px; margin-bottom: 15px; }
        .property img { max-width: 200px; }
        .property h3 { margin: 0; }
    </style>
</head>
<body>

<div class="container">
    <h2>Smart Property Listings</h2>

    <div class="filters">
        <form method="GET">
            Budget:
            <input type="number" name="budget" value="<?php echo $budget; ?>">

            Location:
            <input type="text" name="location" value="<?php echo htmlspecialchars($preferredLocation); ?>">

            Type:
            <select name="type">
                <option value="">Any</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Land">Land</option>
            </select>

            <button type="submit">Find Best Matches</button>
        </form>

        <small>
            Listings are ranked using price proximity, location match, property type, and size.
        </small>
    </div>

    <?php while ($row = $result->fetch_assoc()): ?>
        <div class="property">
            <h3><?php echo htmlspecialchars($row['title']); ?></h3>
            <p><strong>Price:</strong> <?php echo number_format($row['price']); ?></p>
            <p><strong>Location:</strong> <?php echo $row['location']; ?></p>
            <p><strong>Type:</strong> <?php echo $row['type']; ?></p>
            <p><strong>Bedrooms:</strong> <?php echo $row['bedrooms']; ?></p>
        </div>
    <?php endwhile; ?>
</div>

</body>
</html>
