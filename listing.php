<?php
// Reality Kisumu Hub - Smart Recommendation Engine
$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "real_estate";

$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);
$db_connected = !$conn->connect_error;

// User inputs
$budget = isset($_GET['budget']) && is_numeric($_GET['budget']) ? (float)$_GET['budget'] : 25000000;
$preferredLocation = isset($_GET['location']) ? trim($_GET['location']) : '';
$preferredType = isset($_GET['type']) ? trim($_GET['type']) : '';
$minBedrooms = isset($_GET['bedrooms']) && is_numeric($_GET['bedrooms']) ? (int)$_GET['bedrooms'] : 0;

$properties = [];

if ($db_connected) {
    // Dynamic percentage-based scoring SQL algorithm
    $locationParam = "%" . $preferredLocation . "%";
    
    $sql = "
    SELECT *,
    (
        CASE
            WHEN price BETWEEN (? * 0.8) AND (? * 1.2) THEN 35
            WHEN price BETWEEN (? * 0.6) AND (? * 1.4) THEN 25
            WHEN price BETWEEN (? * 0.4) AND (? * 1.6) THEN 15
            ELSE 5
        END
        +
        CASE
            WHEN ? != '' AND location LIKE ? THEN 35
            ELSE 0
        END
        +
        CASE
            WHEN ? != '' AND (type = ? OR category = ?) THEN 20
            ELSE 0
        END
        +
        CASE
            WHEN bedrooms >= ? AND ? > 0 THEN 10
            ELSE 0
        END
    ) AS smart_score
    FROM properties
    ORDER BY smart_score DESC, price ASC
    ";

    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param(
            "ddddddssssi",
            $budget, $budget,
            $budget, $budget,
            $budget, $budget,
            $preferredLocation, $locationParam,
            $preferredType, $preferredType, $preferredType,
            $minBedrooms, $minBedrooms
        );
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $properties[] = $row;
        }
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Smart Property Listings - Reality Kisumu Hub</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .score-badge {
            background: linear-gradient(135deg, #2471a3, #1b263b);
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9rem;
        }
    </style>
</head>
<body class="bg-light">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand fw-bold" href="index.html">Reality Kisumu Hub</a>
            <div class="navbar-nav ms-auto">
                <a class="nav-link" href="index.html">Home</a>
                <a class="nav-link" href="house.html">Browse Houses</a>
                <a class="nav-link active" href="listing.php">Smart Search (PHP)</a>
            </div>
        </div>
    </nav>

    <div class="container my-5">
        <div class="text-center mb-4">
            <h2 class="fw-bold">🧠 Smart Property Recommendation Engine</h2>
            <p class="text-muted">Listings are dynamically ranked by weighted score matching budget proximity, location, and specifications.</p>
        </div>

        <!-- Filter Form -->
        <div class="card shadow-sm p-4 mb-4">
            <form method="GET" class="row g-3">
                <div class="col-md-3">
                    <label class="form-label fw-bold">Target Budget (KSh)</label>
                    <input type="number" name="budget" class="form-control" value="<?php echo htmlspecialchars($budget); ?>">
                </div>

                <div class="col-md-3">
                    <label class="form-label fw-bold">Preferred Location</label>
                    <input type="text" name="location" class="form-control" placeholder="e.g. Milimani, Riat" value="<?php echo htmlspecialchars($preferredLocation); ?>">
                </div>

                <div class="col-md-3">
                    <label class="form-label fw-bold">Property Type</label>
                    <select name="type" class="form-select">
                        <option value="">Any Type</option>
                        <option value="Apartment" <?php echo $preferredType === 'Apartment' ? 'selected' : ''; ?>>Apartment</option>
                        <option value="Villa" <?php echo $preferredType === 'Villa' ? 'selected' : ''; ?>>Villa</option>
                        <option value="Bungalow" <?php echo $preferredType === 'Bungalow' ? 'selected' : ''; ?>>Bungalow</option>
                        <option value="Land" <?php echo $preferredType === 'Land' ? 'selected' : ''; ?>>Land</option>
                    </select>
                </div>

                <div class="col-md-3 d-flex align-items-end">
                    <button type="submit" class="btn btn-primary w-100 fw-bold">Calculate Relevance & Rank</button>
                </div>
            </form>
        </div>

        <?php if (!$db_connected): ?>
            <div class="alert alert-warning text-center">
                <strong>Database Notice:</strong> MySQL server is not connected. Import <code>schema.sql</code> into MySQL database <code>real_estate</code> to enable live PHP scoring. Meanwhile, you can test browser smart ranking on <a href="house.html" class="alert-link">house.html</a>!
            </div>
        <?php else: ?>
            <div class="row">
                <?php if (empty($properties)): ?>
                    <div class="col-12"><div class="alert alert-info">No properties found. Try broadening your criteria.</div></div>
                <?php else: ?>
                    <?php foreach ($properties as $row): ?>
                        <div class="col-md-6 mb-4">
                            <div class="card h-100 shadow-sm border-0">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h5 class="card-title fw-bold mb-0"><?php echo htmlspecialchars($row['title']); ?></h5>
                                        <span class="score-badge">🌟 Match Score: <?php echo htmlspecialchars($row['smart_score']); ?>/100</span>
                                    </div>
                                    <p class="text-primary fw-bold fs-5 mb-2">KSh <?php echo number_format($row['price']); ?></p>
                                    <p class="card-text text-muted mb-2">
                                        📍 <strong>Location:</strong> <?php echo htmlspecialchars($row['location']); ?> |
                                        🏠 <strong>Category:</strong> <?php echo htmlspecialchars($row['category']); ?> |
                                        🛏️ <strong>Bedrooms:</strong> <?php echo htmlspecialchars($row['bedrooms']); ?>
                                    </p>
                                    <p class="card-text small text-secondary"><?php echo htmlspecialchars($row['description']); ?></p>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>

</body>
</html>
