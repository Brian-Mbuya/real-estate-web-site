<?php
// Reality Kisumu Hub - Server Recommendation Engine (PHP Mode)
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
    <title>PHP Search Engine | Reality Kisumu Hub</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#0b192c">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="manifest.json">

    <!-- Bootstrap CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Main Design System CSS -->
    <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>

    <!-- Header / Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark py-3 sticky-top border-bottom border-secondary">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2" href="index.html">
                <svg class="icon-svg fs-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Reality Kisumu Hub</span>
            </a>
            
            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
                    <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="house.html">Browse Listings</a></li>
                    <li class="nav-item"><a class="nav-link active" href="listing.php">PHP Smart Engine</a></li>
                    <li class="nav-item"><a class="nav-link" href="liked.html">Saved Favorites</a></li>
                </ul>
                
                <div class="d-flex align-items-center gap-2">
                    <button id="pwaInstallBtn" class="btn btn-outline-light btn-sm d-none fw-semibold">Install App</button>
                    <a href="login.html" class="btn btn-outline-light btn-sm px-3 fw-semibold">Sign In</a>
                    <a href="signup.html" class="btn btn-amber btn-sm px-3">Create Account</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Header Banner -->
    <header class="bg-dark text-white py-4 border-bottom border-secondary mb-4">
        <div class="container">
            <h1 class="h2 fw-bold mb-1">PHP & MySQL Recommendation Engine</h1>
            <p class="text-secondary small mb-0">Server-side weighted scoring query calculating budget proximity and specification matches.</p>
        </div>
    </header>

    <div class="container mb-5">
        <!-- Search Card -->
        <div class="card border-0 shadow-sm rounded-3 p-4 mb-4">
            <form method="GET" class="row g-3">
                <div class="col-md-3">
                    <label class="form-label small fw-bold text-secondary">Target Budget (KSh)</label>
                    <input type="number" name="budget" class="form-control" value="<?php echo htmlspecialchars($budget); ?>">
                </div>

                <div class="col-md-3">
                    <label class="form-label small fw-bold text-secondary">Location</label>
                    <input type="text" name="location" class="form-control" placeholder="e.g. Milimani, Riat" value="<?php echo htmlspecialchars($preferredLocation); ?>">
                </div>

                <div class="col-md-3">
                    <label class="form-label small fw-bold text-secondary">Property Type</label>
                    <select name="type" class="form-select">
                        <option value="">Any Type</option>
                        <option value="Apartment" <?php echo $preferredType === 'Apartment' ? 'selected' : ''; ?>>Apartment</option>
                        <option value="Villa" <?php echo $preferredType === 'Villa' ? 'selected' : ''; ?>>Villa</option>
                        <option value="Bungalow" <?php echo $preferredType === 'Bungalow' ? 'selected' : ''; ?>>Bungalow</option>
                        <option value="Land" <?php echo $preferredType === 'Land' ? 'selected' : ''; ?>>Land</option>
                    </select>
                </div>

                <div class="col-md-3 d-flex align-items-end">
                    <button type="submit" class="btn btn-brand w-100 fw-bold py-2">Rank Properties</button>
                </div>
            </form>
        </div>

        <?php if (!$db_connected): ?>
            <div class="alert alert-light border rounded-3 p-4 text-center">
                <h5 class="fw-bold text-dark mb-2">MySQL Database Connection Offline</h5>
                <p class="text-secondary small mb-0">Import <code>schema.sql</code> into MySQL database <code>real_estate</code> to execute live PHP SQL queries. Alternatively, test the client-side ranking on <a href="house.html" class="fw-bold">house.html</a>!</p>
            </div>
        <?php else: ?>
            <div class="row g-4">
                <?php if (empty($properties)): ?>
                    <div class="col-12"><div class="alert alert-light border text-center p-4">No properties match your current query.</div></div>
                <?php else: ?>
                    <?php foreach ($properties as $row): ?>
                        <div class="col-md-6">
                            <div class="card-property p-4 h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h5 class="fw-bold mb-0"><?php echo htmlspecialchars($row['title']); ?></h5>
                                        <span class="badge-relevance">Match Score: <?php echo htmlspecialchars($row['smart_score']); ?>/100</span>
                                    </div>
                                    <div class="fs-4 fw-bold text-dark mb-2">KSh <?php echo number_format($row['price']); ?></div>
                                    <div class="text-secondary small mb-3">
                                        📍 <strong>Location:</strong> <?php echo htmlspecialchars($row['location']); ?> |
                                        <strong>Category:</strong> <?php echo htmlspecialchars($row['category']); ?>
                                    </div>
                                    <p class="text-secondary small mb-3"><?php echo htmlspecialchars($row['description']); ?></p>
                                </div>
                                <div class="pt-3 border-top">
                                    <a href="https://wa.me/254746672821?text=<?php echo urlencode('Hi, inquiring about: ' . $row['title']); ?>" target="_blank" class="btn btn-success btn-sm fw-semibold w-100">
                                        WhatsApp Agent
                                    </a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4 mt-5 border-top border-secondary">
        <div class="container text-center small text-secondary">
            &copy; 2026 Reality Kisumu Hub. All rights reserved.
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/pwa.js"></script>
</body>
</html>
